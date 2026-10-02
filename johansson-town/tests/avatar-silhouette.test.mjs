import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRecipe,encodeRecipe,decodeRecipe} from '../src/avatars/recipe.js';
import {measure} from '../src/avatars/build.js';
import {CAST_RECIPES} from '../src/avatars/cast.js';

test('silhouette is saved explicitly and old recipes retain a safe neutral body',()=>{assert.equal(normalizeRecipe({body:{build:.3}}).body.silhouette,'neutral');assert.equal(normalizeRecipe({body:{silhouette:'invalid'}}).body.silhouette,'neutral');for(const silhouette of ['neutral','feminine','masculine']){const r=normalizeRecipe({body:{silhouette}});assert.equal(decodeRecipe(encodeRecipe(r)).body.silhouette,silhouette);}});

test('body silhouettes change shoulders, waist and hips independently of height, head or face',()=>{const r=normalizeRecipe({body:{height:.5,build:.5}}),f=measure({...r,body:{...r.body,silhouette:'feminine'}}),m=measure({...r,body:{...r.body,silhouette:'masculine'}});assert.equal(f.H,m.H);assert.equal(f.Rh,m.Rh);assert.ok(f.width<m.width);assert.ok(f.hips/f.width>m.hips/m.width);assert.ok(f.waistRatio<m.waistRatio);assert.ok(f.hand>0&&f.neck>0);assert.equal(CAST_RECIPES.Thuan.body.silhouette,'feminine');assert.equal(CAST_RECIPES.Johansson.body.silhouette,'masculine');});
