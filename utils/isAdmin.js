function isAdmin(req, res, next){

    console.log("USER DATA:", req.user); // 👈 ADD THIS

    if(req.user.email === "pari@gmail.com"){
        next();
    } else {
        res.status(403).send("Access denied ❌");
    }
}
    module.exports = isAdmin;

