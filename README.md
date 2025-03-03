# StockoTrade

An application where users can invest in the stock market with real-time stock prices using fake money. This concept is known as “paper trading” and allows users to test different trading strategies with real time data. Usually this is a for-profit service that makes users have a subscription, but we provide it for free. This is a great way to practice trading while removing the risk associated with using real money. Users can compete against each other and view detailed statistics regarding their portfolios. Ultimately, they will gain invaluable knowledge to begin trading on the real stock market.

## Authors

- Joshua Hizgiaev
- Matthew Soltys
- Tanav Thota
- Hargun Sawhney

## Tech Stack

1. Frontend: Simple HTML and CSS
2. Backend: Express.js
3. Database: MongoDB
4. Data Visualization: D3.js
5. JavaScript runtime: Node.js

### Key dependencies

1. ``d3``
2. ``express``
3. ``mongodb``
4. ``yahoo-finance2``

## Instructions for contributing

- Fork the project to your own repository (see the fork button on github):

- Clone the fork you made:

```shell
git clone your_fork_repo_link.git
```

- Setup node project and dependencies:

```shell
npm i
```

- After making your changes, you must add and then commit them:

```shell
git add --all
git commit -m "you need to put a message here"
```

To add specific files, simple remove the ``--all`` and just specify the file names instead. At this point you made changes to your fork and committed them.

- Now you need to push them to see the official change on github:

```shell
git push
```

At this point, if you want to merge your changes to the main codebase, create a **pull request** on GitHub, this will analyze for merge conflicts, and if there are any, fix them on VSCode, recommit and push them, and if there are no merge conflicts it can be accepted to the codebase.

To make sure your fork is up to date with the original, please PULL from the repository:

```shell
git pull
```

After a pull request goes through successfully, GitHub will still retain the fork in your account, so for a team of 4 this will be the development workflow, commit changes to our forks (while keepng up to date with main), make pull requests, bring the changes to main (our production branch) and repeat.

Please refer to git basics: <https://www.atlassian.com/git/tutorials/atlassian-git-cheatsheet> for help with git commands.
