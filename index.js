const PATH = require('path');
const fs = require('fs');
const images = require('images');
const imagemin = require('imagemin');
const AEdataToCSS = require('./AEdataToCss.js');
const imageminPngquant = require('imagemin-pngquant');

const INPUT_IMAGE_DIR_PATH = PATH.resolve(__dirname) + '/input';


readdirP(INPUT_IMAGE_DIR_PATH)
  .then((files)=>{
    return statPAll(files.filter(noIgnore),INPUT_IMAGE_DIR_PATH)
  })
  .then((stats)=>{
    return stats.filter((stat)=>!stat.isFile).map((item)=>item.path);
  })
  .then((dirs)=>{
    return Promise.all(dirs.map((path) => composePic(path)))
  })
  .then((list)=>{
    console.log(list)
  });

function noIgnore(name){
  return name.indexOf('_ignore_') === -1;
}

function composePic(rootPath){
  return readdirP(rootPath)
    .then((files)=>{
      var jsonPath = files.filter(file=>file === 'config.json')[0] ? PATH.join(rootPath,'config.json') : false;
      var imgFiles = files.filter(file=>filterImg(file)).filter(file=>noMax(file)).sort((a,b) => extractNum(a,b))
      return Promise.all([
        imgFiles,
        jsonPath ? readFileP(jsonPath,'utf8') : false,
      ]);
    })
    .then(([imgFiles,json])=>{
      console.log('json====>',json);
      const data = json ? JSON.parse(json) : {};
      console.log('data====>',data);
      return doComposePic(rootPath,imgFiles.map(name=>`${rootPath}/${name}`),data);
    })
}

function doComposePic(dirPath,imgFiles,data){
  const {step,rate,AEdata} = data;
  console.log('step,rate===>',step,rate);
  console.log(dirPath)
  console.log(imgFiles)
  const dirName = PATH.parse(dirPath).name;
  console.log(dirName)
  let AEdataAnalyseTemp = null;

  const length = imgFiles.length;
  let first = imgFiles[0];
  const name = dirName + '_max_';
  const fullName = PATH.join(dirPath,name +'.png');

  if (AEdata){
    AEdataAnalyseTemp =  AEdataToCSS(AEdata).AEdataAnalyseTemp;
  }
  

  
  let width = images(first).width();
  let height = images(first).height();
  // let bgsWidth = width;
  // let bgsHeight = height*length;

  
  const maxHeight = 4096;
  const allHeight = width*length;
  const row = ~~(allHeight / maxHeight) + 1;
  const col = Math.ceil(length / row);

  const longImgWidth = row * width;
  const longImgHeight = col * height;
  const position = imgFiles.map((img,index) => {
    const x = index % row * width;
    const y = ~~(index / row) * height;
    return [x,y];
  });


  const longImg = imgFiles.reduce((pre,cur,index)=>{
    const curImg = images(cur);
    const [x,y]= position[index];
    return pre.draw(curImg,x,y);
  },images(longImgWidth,longImgHeight));


  console.log(width);
  console.log(height);
  console.log(position);
  console.log(longImgWidth);
  console.log(longImgHeight);

  // const longImg = imgFiles.reduce((pre,cur)=>{
  //   const curImg = images(cur);
  //   const height = curImg.height();
  //   return {
  //     image:pre.image.draw(curImg,0,pre.height),
  //     height:pre.height + height
  //   }
  // },{image:images(bgsWidth,bgsHeight),height:0}).image;

  longImg.save(fullName);

  makeTemp(name,fullName,width,height,longImgWidth,longImgHeight,length,step,rate,position);
  if (AEdataAnalyseTemp) writeAEdataAnalyseTemp(fullName,AEdataAnalyseTemp);
  imagemin([fullName],dirPath, {
    plugins: [
      imageminPngquant({quality: '65-80'})
    ]
  }).then((files)=>console.log(files))
  


}

function extractNum(a,b){
  const aE = matchNum(a);
  const bE = matchNum(b);
  return aE - bE;
}

function statPAll(files,path){
  return Promise.all(
    files.map(file=>{
      const _path = PATH.join(path,file);
      return statP(_path).then((stats)=>{return {file,path:_path,isFile:stats.isFile()}});
    })
  );
}

function statP(path){
  return new Promise((resolve, reject)=>{
    fs.stat(path,function(err,stats){
      if(err){
        return reject(err);
      } else {
        return resolve(stats);
      }
    });
  });
}

function readdirP(path){
  return new Promise((resolve, reject)=>{
    fs.readdir(path,function(err,files){
      if(err){
        return reject(err);
      } else {
        return resolve(files);
      }
    });
  });
}

function readFileP(path,mode){
  return new Promise((resolve, reject)=>{
    fs.readFile(path,mode,function(err,bytesRead){
      if(err){
        return reject(err);
      } else {
        return resolve(bytesRead);
      }
    });
  });
}


function noMax(name){
  var regexObj = /_max_/i;
  return !regexObj.test(name);
}


function filterImg(name){
  var regexObj = /\.(png|jpg|jpeg)$/i;
  return regexObj.test(name)
}

function matchNum(name){
  var _name = name.replace("@2x","")
  var reg = _name.match(/\d+/g);
  if (reg.length > 0) return parseInt(reg[reg.length -1]);
  return 0;
}


function writeAEdataAnalyseTemp(fullName,AEdataAnalyseTemp){
  fs.writeFile(fullName + '_ae_.scss', AEdataAnalyseTemp, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
}


function makeTemp(name,fullName,width,height,longImgWidth,longImgHeight,length,step,rate=0.1,position) {

  let keyframes;
  let time;
  let steps = 1;
  let temp = fullName.split('/');
  let imageName = temp[temp.length - 1];
  let cssName = name.replace('@','_0_')

  if (!step) {
    step = new Array(length).join(',').split(',').map(function(i,index){return index});
  } 
  console.log(step)

  time = step.length * rate +'s';
  
  console.log(longImgHeight,height)
    console.log(longImgHeight - height)
  // if (step) {
    keyframes = step.reduce((pre,cur,index,array)=>{
      return pre + `
                  ${index/array.length*100}% {background-position:${(position[cur][0])*-1}px ${(position[cur][1])*-1}px;}
      `
    },'') + `
                  100% {background-position:${(position[step[step.length - 1]][0])*-1}px ${(position[step[step.length - 1]][1])*-1}px;}
    `
    
  // } else {
  //   keyframes = `
  //     from {background-position:0 0;}
  //     to {background-position:0 -${(longImgHeight - height)}px;}
  //   `
  // }
  const tempCss = `
    svg {
      width: ${width}px;
      height: ${height}px;
    }
    svg > foreignObject {
      width: ${width}px;
      height: ${height}px;
    }
    svg > foreignObject > div {
      width: ${width}px;
      height: ${height}px;
      background-image: url('./${imageName}');
      background-repeat: no-repeat;
      background-position: 0 0;
      background-size: ${longImgWidth}px ${longImgHeight}px;
    }
    svg > foreignObject > div.type_anim {
      animation:anim_${cssName} ${time} steps(${steps}) 0s infinite;
    }
    @keyframes anim_${cssName}{
      ${keyframes}
    }
  `;
  const tempScss = `
      svg {
        width: ${width}px;
        height: ${height}px;
        > foreignObject {
          width: ${width}px;
          height: ${height}px;
          > div{
            width: ${width}px;
            height: ${height}px;
            background-image: url(${imageName});
            background-repeat: no-repeat;
            background-position: 0 0;
            background-size: ${longImgWidth}px ${longImgHeight}px;
            &.type_anim{
              animation:anim_${cssName} ${time} steps(${steps}) 0s infinite;
              @at-root{
                @keyframes anim_${cssName}{
                  ${keyframes}
                }
              }
            }
          }
        }
      }
  `;
  const tempHTML = `
<html>
  <head>
    <style>
      ${tempCss}
    </style>
  </head>
  <body>
    <svg viewBox="0, 0, ${width}, ${height}"><foreignObject width="${width}" height="${height}"><div class="type_anim"> </div></foreignObject></svg>
  </body>
</html>
  `;
  fs.writeFile(fullName + '.html', tempHTML, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
  fs.writeFile(fullName + '.scss', tempScss, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  });
  fs.writeFile(fullName + '.position.json', JSON.stringify(position), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
}


