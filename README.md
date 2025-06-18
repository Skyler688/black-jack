# **Project Overview**

## Plan

A basic blackjack game that is secure and cheat proof. This is done through putting all game state and logic on the backend and restricting the game play routes with session cookies. I would like to make card components on the front end and use transform animations to draw and flip cards. I also will be makeing a fake cheakout/ cashout to get chips and or money to play the game.

## Curent layout

Ive decided to use two servers for the project, an express backend and a nextJS frontend. Ive layed out the building blocks for my api requests on the backend and
established a connection with a mongoBD atlas database to manage user data. I am using bycrypt to hash passwords, and have locked out any restriceted routes with
a session cookie and auth middleware. On the nextJS server i am restricting main page access with that cookie. as well as a check function that runs server side to prevent bypasing by the client modifing the code. I have also set up a way to track the game state for each user on the express server, this is done through a class with a constructor that has all the nessisary functions to generate and modify the deck. I then use the Map() function the easaly create, get and delete, the users deck instance. I have not made the actual gamplay routes only some testing ones to insure the basic deck functions work as expected.
