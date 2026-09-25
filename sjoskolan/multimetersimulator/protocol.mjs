// Keep older records readable and prevent student text from becoming spreadsheet formulas.
export function protocolCSV(records,modes={}) {
  const rows=[['Tid (UTC)','Övning','Steg','Funktion','Uttag','Röd spets','Svart spets','Avläsning','Moment','Ingångsresistans (Ω)','Egen förklaring','Övningsversion'],
    ...records.map(r=>[r.time,r.lesson,r.step,modes[r.mode]||r.mode,r.jack==='v'?'V Ω':r.jack,r.red,r.black,r.reading,r.moment,r.input,r.comment,r.revision])];
  const cell=value=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
  return '\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n');
}
