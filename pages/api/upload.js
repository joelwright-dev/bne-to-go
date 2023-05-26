import formidable from "formidable";
const fs = require("fs-extra");
import { getSession } from "next-auth/react"

export const config = {
  api: {
    bodyParser: false
  }
};

const uploadForm = next => async (req, res) => {
    const session = await getSession({req, res})

    if(!session) {
        res.send({status: 404, message: "Not found"})
    } else {
        return new Promise(async (resolve, reject) => {
            try {
                const form = new formidable.IncomingForm({
                    multiples: true,
                    keepExtensions: true
                });

                form.once("error", console.error);

                form.on("fileBegin", (name, file) => {
                    console.log(file)
                    console.log("start uploading: ", file.newFilename);
                }).on("aborted", () => console.log("Aborted..."));
                
                form.once("end", () => {
                    console.log("Done!");
                });

                await form.parse(req, async (err, fields, files) => {
                    if (err) {
                        throw String(JSON.stringify(err, null, 2));
                    }
                    console.log("moving file: ", files.file.filepath, " to ", `public/upload/${files.file.newFilename}`);

                    fs.mkdirs(`public/upload`)
                    fs.renameSync(files.file.filepath, `public/upload/${files.file.newFilename}`);
                    req.form = { fields, files };
                    return resolve(next(req, res));
                });
            } catch (error) {
                return resolve(res.status(403).send(error));
            }
        });
    }
};

async function handler(req, res) {  
    try {
        if (req.method === "POST") {
            res.status(200).send(req.form);
        } else {
            throw String("Method not allowed");
        }
    } catch (error) {
        res.status(400).json({ message: JSON.stringify(error, null, 2) });
    }
}

export default uploadForm(handler);