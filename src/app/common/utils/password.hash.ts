import bcrypt from "bcryptjs";

async function hashPassword(password:string) {
    return await bcrypt.hash(password, 10)
}


async function comparePassword(userPassword:string, hashPassword:string ) {
    return await bcrypt.compare(userPassword, hashPassword)
}

export {hashPassword, comparePassword}