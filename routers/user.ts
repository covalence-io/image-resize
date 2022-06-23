import { Router } from 'express';
import multer from 'multer';

const uploads = multer({ dest: 'public/uploads' });

export default function users() {
    const router = Router();

    router
        .get('/', (req, res, next) => {
            res.json({
                id: 1,
                firstname: 'Matt',
                lastname: 'Morgan',
            });
        })
        .post('/avatar', uploads.single('avatar'), (req, res, next) => {
            if (!!req.file) {
                res.json({
                    url: `/uploads/${req.file.filename}`,
                });
            } else {
                next(new Error('No file found'));
            }
        });

    return router;
}

function generateDoc(filename: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avatar</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <h1>My Avatar</h1>
    <img src="/uploads/${filename}" alt="" />
</body>
</html>
`;
}