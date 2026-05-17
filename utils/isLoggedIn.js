const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next){

    let token = req.cookies.token;

    if(!token){

        return res.status(401).send(`

            <html>

            <head>

                <title>Login Required</title>

                <style>

                    body{
                        margin:0;
                        height:100vh;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        background:linear-gradient(
                            to bottom,
                            #fff7f2,
                            #fdf6ef
                        );
                        font-family: 'Fredoka', sans-serif;
                    }

                    .box{
                        background:white;
                        padding:50px;
                        border-radius:25px;
                        text-align:center;
                        box-shadow:0 10px 30px rgba(0,0,0,0.1);
                        width:350px;
                    }

                    h1{
                        color:#d48c6a;
                        margin-bottom:15px;
                    }

                    p{
                        color:#666;
                        margin-bottom:25px;
                    }

                    a{
                        text-decoration:none;
                    }

                    button{
                        background:#e8b89b;
                        border:none;
                        padding:12px 25px;
                        border-radius:30px;
                        color:white;
                        font-size:16px;
                        cursor:pointer;
                        font-weight:bold;
                    }

                    button:hover{
                        background:#d79f7d;
                    }

                </style>

            </head>

            <body>

                <div class="box">

                    <h1>
                        Oops! 🔒
                    </h1>

                    <p>
                        You must login first to continue shopping 🍼
                    </p>

                    <a href="/users/login">

                        <button>
                            Login Now
                        </button>

                    </a>

                </div>

            </body>

            </html>

        `);

    }

    try{

        let data = jwt.verify(token, "secretkey");

        req.user = data;

        next();

    } catch(err){

        return res.status(401).send("Invalid token");

    }

}

module.exports = isLoggedIn;
