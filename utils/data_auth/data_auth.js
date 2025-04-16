// File to validate (error check) data inputs
export const checkUserData = (userName, firstName, lastName, email, password, age, birthday) => {
    const trimUserName = checkUserName(userName)
}

const checkString = (inp, varName) => {
    if(typeof inp !== 'string') throw `ERROR: ${varName} must be a string.`
    const trimInput = inp.trim()
    if(trimInput.length < 1) throw `ERROR: ${varName} cannot be empty`
    return trimInput
}

const checkUserName = (userName) => {

}

const checkFirstName = (firstName) => {

}

const checkLastName = (lastName) => {

}

const checkEmail = (userName) => {

}

const checkPassword = (userName) => {

}

const checkAge = (userName) => {

}

const checkBirthday = (userName) => {

}
