'use strict';

function AEdataToCSS(AEdata) {
  // console.log(AEdata);
  const {layers,fr} = AEdata;
  // const steps = createEmptyArrayByLength(op);
  const AEdataAnalyse = layers.map(item=>formatData(item));
  const AEdataAnalyseTemp = makeAEdataAnalyseTemp(AEdataAnalyse,fr);
  return {AEdataAnalyse,AEdataAnalyseTemp};
}

function makeAEdataAnalyseTemp(AEdataAnalyse,fr){
  return AEdataAnalyse.map(item=>{
    const {
      refId,op,ip,ks,nm,
      opacity,
      rotate,
      position,
      scale,
      anchor
    } = item;
    const steps = createIndexArrayByLength(op);
    const last = steps[steps.length -1]
    const keyframes = steps.reduce((pre,cur,index,array)=>{
      return pre + `
                  ${index/array.length*100}% {transform:${position[cur]} ${rotate[cur]} ${scale[cur]}}
      `
    },'') + `
                  100% {transform:${position[last]} ${rotate[last]} ${scale[last]}}
    `
    const tempScss = `
      animation:anim_${nm} ${op/fr}s linear 0s;
      @at-root{
        @keyframes anim_${nm}{
          ${keyframes}
        }
      }
    `
    return tempScss;
  }).reduce((pre,cur)=>{
    return pre + `
    ${cur}
    `
  },"");
}

function formatData(data){
  // console.log(data);
  const {refId,op,ip,ks,nm} = data;
  const {o,r,p,a,s} = ks;
  // console.log(ks);
  const opacity = formatOpacity(o,op);
  const rotate = formatRotate(r,op);
  const position = formatPosition(p,op);
  const scale = formatScale(s,op);
  const anchor = formatAnchor(a,op);
  // console.log(rotate,position,scale)
  return {
    refId,op,ip,ks,nm,refId,
    opacity,
    rotate,
    position,
    scale,
    anchor
  }
}

function editStepInRange(steps,value,start,end){
  for (let i = start; i <= end; i++) {
    steps[i] = value;
  }
}

function createIndexArrayByLength(length){
  return Array(length).join(" ").split(" ").map((item,index)=>index);
}

function formatOpacity(data,length){
  // TODO
  if (data.a === 0) return "";
  const steps = createEmptyArrayByLength(length);
}

function formatRotate(data,length){
  if (data.a === 0) return "";
  const steps = createEmptyArrayByLength(length);
  const {k} = data;
  k.reduce((pre,cur)=>{
    let rotate;
    let deg;
    if (pre.t === undefined) {
      deg = cur.s[0];
      rotate = `rotate(${deg}deg)`;
      editStepInRange(steps,rotate,0,cur.t)
    } else if (pre.t !== undefined && cur.t !== undefined) {
      let start = pre.s[0];
      let every = (pre.e[0] - pre.s[0]) / (cur.t - pre.t);
      let arr = createIndexArrayByLength(cur.t - pre.t).map(item=>item+pre.t+1).reduce((_pre,_cur)=>{
        steps[_cur] = `rotate(${_pre.start + _pre.every}deg)`;
        return {
          start:_pre.start + _pre.every,
          every:_pre.every,
        }
      },{
        start:start,
        every:every,
      })
      if (cur.s === undefined) {
        deg = pre.e[0];
        rotate = `rotate(${deg}deg)`;
        editStepInRange(steps,rotate,cur.t,steps.length -1);
      }
    }
    return cur;
  },{});
  return steps;
}

function formatPosition(data,length){
  if (data.a === 0) return "";
  const steps = createEmptyArrayByLength(length);
  const {k} = data;
  k.reduce((pre,cur)=>{
    let position;
    let x;
    let y;
    if (pre.t === undefined) {
      x = cur.s[0];
      y = cur.s[1];
      position = `translate3d(${pxToRem(x)},${pxToRem(y)},0)`;
      editStepInRange(steps,position,0,cur.t)
    } else if (pre.t !== undefined && cur.t !== undefined) {
      let startX = pre.s[0];
      let startY = pre.s[1];
      let everyX = (pre.e[0] - pre.s[0]) / (cur.t - pre.t);
      let everyY = (pre.e[1] - pre.s[1]) / (cur.t - pre.t);
      let arr = createIndexArrayByLength(cur.t - pre.t).map(item=>item+pre.t+1).reduce((_pre,_cur)=>{
        steps[_cur] = `translate3d(${pxToRem(_pre.startX + _pre.everyX)},${pxToRem(_pre.startY + _pre.everyY)},0)`;
        return {
          startX:_pre.startX + _pre.everyX,
          startY:_pre.startY + _pre.everyY,
          everyX:_pre.everyX,
          everyY:_pre.everyY,
        }
      },{
        startX:startX,
        startY:startY,
        everyX:everyX,
        everyY:everyY,
      })
      if (cur.s === undefined) {
        x = pre.e[0];
        y = pre.e[1];
        position = `translate3d(${pxToRem(x)},${pxToRem(y)},0)`;
        editStepInRange(steps,position,cur.t,steps.length -1);
      }
    }
    return cur;
  },{});
  return steps;

}

function pxToRem(num){
  return num / 40 + 'rem';
}
function formatScale(data,length){
  if (data.a === 0) return "";
  const steps = createEmptyArrayByLength(length);
  const {k} = data;
  k.reduce((pre,cur)=>{
    let scale;
    let x;
    let y;
    let z;
    if (pre.t === undefined) {
      x = cur.s[0];
      y = cur.s[1];
      z = cur.s[2];
      scale = `scale3d(${x/100},${y/100},${z/100})`;
      editStepInRange(steps,scale,0,cur.t)
    } else if (pre.t !== undefined && cur.t !== undefined) {
      let startX = pre.s[0];
      let startY = pre.s[1];
      let startZ = pre.s[2];
      let everyX = (pre.e[0] - pre.s[0]) / (cur.t - pre.t);
      let everyY = (pre.e[1] - pre.s[1]) / (cur.t - pre.t);
      let everyZ = (pre.e[2] - pre.s[2]) / (cur.t - pre.t);
      let arr = createIndexArrayByLength(cur.t - pre.t).map(item=>item+pre.t+1).reduce((_pre,_cur)=>{
        steps[_cur] = `scale3d(${(_pre.startX + _pre.everyX)/100},${(_pre.startY + _pre.everyY)/100},${(_pre.startZ + _pre.everyZ)/100})`;
        return {
          startX:_pre.startX + _pre.everyX,
          startY:_pre.startY + _pre.everyY,
          startZ:_pre.startZ + _pre.everyZ,
          everyX:_pre.everyX,
          everyY:_pre.everyY,
          everyZ:_pre.everyZ,
        }
      },{
        startX:startX,
        startY:startY,
        startZ:startZ,
        everyX:everyX,
        everyY:everyY,
        everyZ:everyZ,
      })
      if (cur.s === undefined) {
        x = pre.e[0];
        y = pre.e[1];
        z = pre.e[2];
        scale = `scale3d(${x/100},${y/100},${z/100})`;
        editStepInRange(steps,scale,cur.t,steps.length -1);
      }
    }
    return cur;
  },{});
  return steps;
}
function formatAnchor(data,length){
  // TODO
  if (data.a === 0) return "";
  const steps = createEmptyArrayByLength(length);
}

function createEmptyArrayByLength(length){
  return Array(length).join(" ").split(" ");
}

module.exports = AEdataToCSS;