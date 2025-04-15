# TODO List

1. Someone do the handlebars and javascript for signup page
    - It must be an HTML form that performs a POST request and adds data to mongodb
    - Data required: User name (must be unique), First and Last Name, email, password, age, birthday
    - If username already taken dont allow them to signup, full name requirements are leniant, just no numbers or special characters, just A-Z and a-z, also not null or whitespace ofc, for emails there is an email type input in html so lookup the documentation for that, and for birthday, there is also an HTML input type for it so just lookup the documentation for it (date input) to set restrictions on what days they can choose (>= 18 required). Passwords need to be at least 8 characters in length and can use whatever characters the user wants we don't care.
2. Someone do the handlebars and javascript for login page
    - It must be an HTML form that performs a GET request towards the users dashboard
    - Input username and password
    - If they match, just use the userID from mongo to redirect to dashboard/userID
    - Ofc set cookies once again like in signup after successfull login

And of course, **please do error checking** for these two features.

Essentially what should happen when the above is finished is that if sign up, isAuthenticated cookies will be set to true, userID cookies will be set to the objectID of the corresponding mongoDB document. After the POST request goes through (POST dashboard/userId), we should redirect users to the dashboard /dashboard/userID (this will execute a GET request), its ok if this page is blank for now, its just important that the '/' will always reroute to there now AFTER authenticating.

If login, this should perform a GET on /dashboard/userID if the login is successfull, and just error the user otherwise like "wrong password" or "wrong username", those are the only two fields we require. Upon successfull login set cookies like in signup. After login show the dashboard page
