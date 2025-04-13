# TODO List

1. Someone do the handlebars and javascript for signup page
    - It must be an HTML form that performs a POST request and adds data to mongodb
    - Data required: User name (must be unique), First and Last Name, email, password, age, birthday
    - If username already taken dont allow them to signup, full name requirements are leniant, just no numbers or special characters, just A-Z and a-z, also not null or whitespace ofc, for emails there is an email type input in html so lookup the documentation for that, and for birthday, there is also an HTML input type for it so just lookup the documentation for it (date input) to set restrictions. Passwords need to be at least 8 characters in length and can use whatever characters the user wants we don't care.
    - You should also set cookies, in particular set isLoggedIn to true, and create another cookie called userID that stores the mongodb object id for that current user.
    - after successful signup, user should be redirected to /dashboard/userID, which will call the appropriate function in the routers so please do it as well
2. Someone do the handlebars and javascript for login page
    - It must be an HTML form that performs a GET request towards the users dashboard
    - Input username and password
    - If they match, just use the userID from mongdo to redirect to dashboard/userID
    - Ofc set cookies once again like in signup after successfull login

And of course, **please do error checking** for these two features.

Doing these features will require starting to work on our data functions in our data folder, and work on our routes, feel free to make a new route if you see fit (like /users to create users, but I think its possible using a POST towards /dashboard/userId to also be valid). So please finish this before next friday at most! This should allow us to work and crossing off core features over next weekend.
