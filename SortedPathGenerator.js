const fs = require('fs');
const path = require('path');


function* listFilePathsSorted(rootPath, options) {
   const dirEntries = fs.readdirSync(rootPath, {withFileTypes: true}).sort(compareDirents);
   console.log(dirEntries)
   for(entry of dirEntries) {
       if(entry.isDirectory()) {
          const folderGen = listFilePathsSorted(path.join(rootPath, entry.name));
          for(entry of folderGen) {
             yield entry;
          }
       } else {
          yield path.join(rootPath, entry.name);
       }
   }
}

function compareDirents(a, b) {
   if(a.name === b.name)
      return 0;
   return a.name > b.name ? 1 : -1;
}

module.exports = {
   listFilePathsSorted
};