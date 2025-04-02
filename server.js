const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// Thay thế bằng API Key SID và API Key Secret thực tế của bạn từ Stringee
const API_KEY_SID = process.env.API_KEY_SID;
const API_KEY_SECRET = process.env.API_KEY_SECRET;
// Endpoint để tạo userId và Access Token
app.post('/tool/GenerateAccesstoken', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    // Tạo userId dựa trên username hoặc một logic khác tùy theo yêu cầu của bạn
    const userId = `user_${username}`;
    // Tạo Access Token
    const payload = {
        jti: `${API_KEY_SID}-${Date.now()}`, // JWT ID
        iss: API_KEY_SID, // API Key SID
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // Thời gian hết hạn: 30 ngày
        userId: userId
    };
    const token = jwt.sign(payload, API_KEY_SECRET, { algorithm: 'HS256' });
    res.json({ userId, token });
});
// Xử lý yêu cầu từ Stringee để cho phép gọi
app.post('/answer_url', (req, res) => {
    const { from, to } = req.body;
    console.log(`Cuộc gọi từ ${from} đến ${to}`);
    if (!from || !to) {
        console.error('Missing "from" or "to" parameter');
        return res.status(400).json({ message: 'Missing "from" or "to" parameter' });
    }
    const response = [
        {
            "action": "connect",
            "from": {
                "type": "internal",
                "number": from
            },
            "to": {
                "type": "internal",
                "number": to
            }
        }
    ];
    res.setHeader("Content-Type", "application/json");
    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
