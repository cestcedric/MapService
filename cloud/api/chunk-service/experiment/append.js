fs = require('fs');

function append(text){
    return new Promise((resolve, reject)=>{
        fs.appendFile('./indices/message.txt', text, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}


module.exports = append;