const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const parser = require('mailparser').simpleParser;
const { format, writeToStream } = require('@fast-csv/format');

const folder = process.argv[2];
const fullPath = path.resolve(path.join(__dirname, folder));
fs.readdir(fullPath, (err, files) => {
  files.forEach((file) => {
    if (file[0] === '.') {
      return;
    }

    const fullFilePath = path.resolve(path.join(__dirname, folder, file, '/mbox'));

    const stream = fs.createReadStream(fullFilePath);

    const mbox = new Mbox(stream);
    const csv = format({ headers: true });

    csv.pipe(process.stdout);

    mbox.on('message', async (msg) => {
      const message = await parser(msg);
      csv.write({
        name: message.from.value[0].name,
        email: message.from.value[0].address,
      });
    });

    mbox.on('end', () => {
      // console.log('\ndone parsing');
    });
  });
});
