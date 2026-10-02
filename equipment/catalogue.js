/**
 * Every machine in the equipment library. Pages ask for a model by id:
 *
 *   import * as THREE from '/johansson-town/vendor/three.module.js';
 *   import {buildEquipment} from '/equipment/catalogue.js';
 *   const valve=buildEquipment(THREE,'butterfly-valve');
 *   scene.add(valve.group);
 *
 * See README.md for the model contract (parts, explode, cutaway, controls, update).
 */
import {buildButterflyValve,BUTTERFLY_VALVE_META} from './models/butterfly-valve.js';
import {buildInductionMotor,INDUCTION_MOTOR_META} from './models/induction-motor.js';
import {buildGenerator,GENERATOR_META} from './models/generator.js';
import {buildDieselEngine,DIESEL_ENGINE_META} from './models/diesel-engine.js';
import {buildCentrifugalPump,CENTRIFUGAL_PUMP_META} from './models/centrifugal-pump.js';
import {buildShaftCoupling,SHAFT_COUPLING_META} from './models/shaft-coupling.js';
import {buildSwitchboard,SWITCHBOARD_META} from './models/switchboard.js';
export {setExplode,setCutaway,highlight,triangleCount,procedureState,showProcedureStep,clearProcedure} from './kit.js';

export const EQUIPMENT=Object.freeze([
 {...BUTTERFLY_VALVE_META,build:buildButterflyValve},
 {...INDUCTION_MOTOR_META,build:buildInductionMotor},
 {...GENERATOR_META,build:buildGenerator},
 {...DIESEL_ENGINE_META,build:buildDieselEngine},
 {...CENTRIFUGAL_PUMP_META,build:buildCentrifugalPump},
 {...SHAFT_COUPLING_META,build:buildShaftCoupling},
 {...SWITCHBOARD_META,build:buildSwitchboard},
]);

/** Builds one machine by id. */
export function buildEquipment(THREE,id){
 const entry=EQUIPMENT.find(e=>e.id===id);
 if(!entry)throw Error('No equipment called '+id);
 return entry.build(THREE);
}
