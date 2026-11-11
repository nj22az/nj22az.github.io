# JPVM-2R20 Vend Controller – State Machine (PLC-style pseudo-code)

Scope: 20 selections (R1C01..R2C10) → 10 columns (2 selections share a column: R1Cn and R2Cn map to column n).
Cold zone = columns 1–7 (5 °C), Hot zone = columns 8–10 (55 °C). Payment: coins (¥10/50/100/500) through an MDB coin changer,
¥1000 notes through an MDB bill validator, and e-money (transit IC) through an MDB cashless level-3 reader.
The tag names match the `io_*` custom properties in the Blender asset (`vending_machine_metadata.json → io_map`).

## I/O map
| Tag | Type | Description |
|---|---|---|
| DI_SEL_RrCcc (20) | DI | Selection push-buttons (matrix-scanned 4×5 on the HMI board) |
| DI_CAM_01..10 | DI | Vend-motor cam home switch (one revolution = one product) |
| DI_EMPTY_01..10 | DI | Column sold-out switch (NC; open = empty) |
| DI_DROP | DI | IR drop sensor in the chute (confirms the product fell) |
| DI_FLAP_SW | DI | Dispense flap open switch |
| DI_DOOR_SW | DI | Door switch (service mode) |
| DI_RET_LEVER | DI | Coin-return lever switch |
| AI_T_COLD / AI_T_HOT | AI | NTC 10k thermistors |
| DO_VEND_M01..10 | DO | 24 VDC vend motors (driven by relays/MOSFETs) |
| DO_LED_RrCcc | DO | Button LEDs (blue = cold, red = hot) |
| DO_SOLDOUT_RrCcc | DO | 売切 (sold-out) lamps |
| DO_COMP / DO_HEATER / DO_FAN_EVAP / DO_FAN_COND / DO_HEATER_FAN | DO | Thermal loads (through the relay board/SSR) |
| DO_DISPLAY_LIGHT | DO | LED backlight (dimmed by the light sensor / timer) |
| MDB | Bus | 9600 baud, 9-bit: coin changer (0x08), bill validator (0x30), cashless (0x10) |
| SER_LCD | Serial | 4-digit credit/price display |

## States
```
IDLE ──credit>0──► CREDIT ──select & credit>=price──► VEND ──drop ok──► CHANGE ──► IDLE
  │                  │  ▲          │ (credit<price: SHOW_PRICE 2 s)      │ drop timeout
  │ IC card tapped   │  └──insert──┘                                   ▼
  ▼                  └──return lever / 180 s timeout ──► CHANGE        VEND_FAIL ─► CHANGE (refund)
CASHLESS_SELECT ─select─► CASHLESS_AUTH ─approved─► VEND ─ok─► CASHLESS_SETTLE ─► IDLE
any state: door open ─► SERVICE ; critical fault ─► FAULT (out of service, refund credit)
```

## Pseudo-code (scan cycle 10 ms)
```pascal
CONST VEND_TIMEOUT := T#4s; DROP_TIMEOUT := T#2s; CREDIT_TIMEOUT := T#180s; MAX_CREDIT := 1000+500;
VAR state : (IDLE, CREDIT, SHOW_PRICE, CASHLESS_SELECT, CASHLESS_AUTH, VEND, VEND_FAIL,
             CHANGE, CASHLESS_SETTLE, SERVICE, FAULT);
    credit : INT; sel : INT; col : INT; price : ARRAY[1..20] OF INT; soldout : ARRAY[1..10] OF BOOL;

// ---------- always (every scan) ----------
FOR c := 1 TO 10 DO soldout[c] := NOT DI_EMPTY[c]; END_FOR
FOR s := 1 TO 20 DO
    DO_SOLDOUT[s] := soldout[col_of(s)];
    // LEDs lit when the item can be bought: blink when credit >= price
    DO_LED[s] := NOT soldout[col_of(s)] AND
                 ((state = CREDIT AND credit >= price[s] AND blink_1Hz) OR state IN (IDLE, CASHLESS_SELECT));
END_FOR
ThermalControl();                        // see below, independent of the vend state
IF DI_DOOR_SW AND state <> SERVICE THEN prev := state; state := SERVICE; END_IF
IF Faults.critical THEN state := FAULT; END_IF
// credit is accepted when the changer can pay change (つり銭切れ check) and credit < MAX_CREDIT
MDB.coin_enable := state IN (IDLE, CREDIT) AND credit < MAX_CREDIT;
MDB.bill_enable := MDB.coin_enable AND CoinTubes.can_change(1000 - min_price);

CASE state OF
IDLE:
    LCD("   0");
    IF MDB.coin_event OR MDB.bill_escrow_accepted THEN credit := credit + MDB.value; state := CREDIT; END_IF
    IF MDB.cashless.begin_session THEN state := CASHLESS_SELECT; T_sess(IN:=TRUE); END_IF

CREDIT:
    LCD(credit);
    IF MDB.coin_event OR MDB.bill_escrow_accepted THEN credit := credit + MDB.value; T_credit(IN:=FALSE); END_IF
    T_credit(IN:=TRUE, PT:=CREDIT_TIMEOUT);
    IF DI_RET_LEVER OR T_credit.Q THEN state := CHANGE; END_IF
    sel := ButtonEdge();
    IF sel > 0 THEN
        col := col_of(sel);
        IF soldout[col] THEN Beep(2);
        ELSIF credit < price[sel] THEN state := SHOW_PRICE; T_show(IN:=TRUE, PT:=T#2s);
        ELSE credit := credit - price[sel]; state := VEND; StartVend(col);
        END_IF
    END_IF

SHOW_PRICE:
    LCD(price[sel]); IF T_show.Q THEN state := CREDIT; END_IF

CASHLESS_SELECT:
    LCD(MDB.cashless.balance);
    sel := ButtonEdge();
    IF sel > 0 AND NOT soldout[col_of(sel)] THEN MDB.cashless.vend_request(price[sel]); state := CASHLESS_AUTH; END_IF
    IF T_sess.Q OR MDB.cashless.session_cancel THEN MDB.cashless.session_complete(); state := IDLE; END_IF

CASHLESS_AUTH:
    IF MDB.cashless.vend_approved THEN col := col_of(sel); state := VEND; StartVend(col);
    ELSIF MDB.cashless.vend_denied OR T_auth.Q THEN Beep(3); state := CASHLESS_SELECT; END_IF

VEND:
    // motor runs until the cam returns home (1 revolution); the drop sensor must trigger
    DO_VEND_M[col] := NOT (cam_left_home AND DI_CAM[col]);
    IF DI_DROP THEN drop_seen := TRUE; END_IF
    IF NOT DO_VEND_M[col] AND drop_seen THEN
        Audit.count(sel);
        IF paid_cashless THEN state := CASHLESS_SETTLE ELSE state := CHANGE; END_IF
    ELSIF T_vend.Q (VEND_TIMEOUT) OR (NOT DO_VEND_M[col] AND T_drop.Q) THEN
        DO_VEND_M[col] := FALSE; Faults.set(COLUMN_JAM, col); state := VEND_FAIL;
    END_IF

VEND_FAIL:
    IF paid_cashless THEN MDB.cashless.vend_failure(); state := IDLE;   // reader refunds the card
    ELSE credit := credit + price[sel]; state := CHANGE; END_IF          // refund the cash price

CHANGE:
    IF credit > 0 THEN MDB.coin.payout(credit) ;  // greedy over the tubes: 500/100/50/10
       IF MDB.payout_done THEN credit := MDB.unpaid; END_IF
       IF credit > 0 AND T_pay.Q THEN Faults.set(CHANGE_EMPTY); credit := 0; END_IF   // log IOU
    ELSE state := IDLE; END_IF

CASHLESS_SETTLE:
    MDB.cashless.vend_success(sel); MDB.cashless.session_complete(); state := IDLE;

SERVICE:   // door open: all vending is inhibited; the service menu is on the key-pad
    AllMotorsOff(); MDB.coin_enable := FALSE;
    ServiceMenu();   // price set, column test vend, temp setpoints, audit (DEX/UCS), tube fill
    IF NOT DI_DOOR_SW THEN state := IDLE; END_IF

FAULT:     // 調整中 (out of service); the credit is refunded first
    LCD("E" + Faults.code); IF credit > 0 THEN MDB.coin.payout(credit); credit := 0; END_IF
    IF Faults.cleared THEN state := IDLE; END_IF
END_CASE

// ---------- thermal (hot/cold) ----------
PROCEDURE ThermalControl;
    // cold zone: compressor hysteresis with 3-min anti-short-cycle; 4-hourly defrost
    IF AI_T_COLD > cold_sp + 2.0 AND T_comp_off.Q THEN DO_COMP := TRUE; END_IF
    IF AI_T_COLD < cold_sp - 1.0 OR Defrost.active THEN DO_COMP := FALSE; END_IF
    DO_FAN_EVAP := TRUE; DO_FAN_COND := DO_COMP;
    // hot zone: heater with hysteresis, plus a thermal fuse (hardware) at 85 °C
    DO_HEATER := (AI_T_HOT < hot_sp - 3.0) OR (DO_HEATER AND AI_T_HOT < hot_sp);
    DO_HEATER_FAN := TRUE;
    // peak-cut (ピークカット): compressor inhibited 13:00–16:00 in Jul–Sep, if enabled
    IF PeakCut.active THEN DO_COMP := FALSE; END_IF
    // faults
    IF sensor_open_or_short(AI_T_COLD) OR sensor_open_or_short(AI_T_HOT) THEN Faults.set(TEMP_SENSOR); END_IF
    IF DO_COMP AND RunTime > 2h AND AI_T_COLD > cold_sp + 8 THEN Faults.set(REFRIG_FAIL); END_IF
END_PROCEDURE
```

## Fault codes
| Code | Fault | Critical? | Reaction |
|---|---|---|---|
| E01 | Column jam / motor timeout (per column) | No | Mark the column sold out and refund |
| E02 | Drop sensor never triggered | No | Refund and log |
| E10 | Coin changer comms lost | Yes* | Cash disabled; cashless still allowed |
| E11 | Change tubes low (つり銭切れ) | No | "Exact change" lamp; bills inhibited |
| E20 | Bill validator jam/full | No | Bills inhibited |
| E30 | Cashless reader offline | No | IC disabled |
| E40 | Cold sensor fault / refrigeration failure | No | Cold columns sold out after 2 h |
| E41 | Hot sensor fault / over-temp | No | Heater off; hot columns sold out |
| E90 | Main board watchdog / EEPROM | Yes | Out of service |

\*Critical only when no other payment method is available.
