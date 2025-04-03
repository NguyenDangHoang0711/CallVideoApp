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

// ✅ Endpoint để tạo userId và Access Token
app.post('/tool/GenerateAccesstoken', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const userId = `user_${username}`;

    const payload = {
        jti: `${API_KEY_SID}-${Date.now()}`,
        iss: API_KEY_SID,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        userId: userId
    };

    const token = jwt.sign(payload, API_KEY_SECRET, { algorithm: 'HS256' });
    res.json({ userId, token });
});

// ✅ Xử lý yêu cầu từ Stringee để cấp quyền gọi
app.get('/project_answer_url', (req, res) => {
    const { from, to } = req.query;
    console.log(`Cuộc gọi từ ${from} đến ${to}`);
    console.log(`✅ Đã nhận request: ${req.method} ${req.url}`);
    console.log("🔎 Query params:", req.query);
    console.log("✅ from:", from);
    console.log("✅ to:", to);

    if (!from || !to || typeof from !== 'string' || typeof to !== 'string') {
        console.error('❌ Thiếu hoặc sai kiểu "from" hoặc "to"');
        return res.status(400).json({ message: 'Missing or invalid "from" or "to" parameter' });
    }

    const response = [
        {
            action: "connect",
            from: {
                type: "internal",
                number: from,
                alias: from
            },
            to: {
                type: "internal",
                number: to,
                alias: to
            },
            timeout: 45,
            maxConnectTime: -1,
            peerToPeerCall: false
        }
    ];
    
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
