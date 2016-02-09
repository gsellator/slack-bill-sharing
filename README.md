# slack-bill-sharing

Slack-bill-sharing is a bill sharing bot for slack.

![alt tag](https://raw.githubusercontent.com/gsellator/slack-bill-sharing/master/public/img/example.png)

## Getting Started

#### Creating a new bot

- Create a bot on [slack's website](https://my.slack.com/services/new/bot)
- Install the project dependencies with `npm install`
- Run the project locally with the `grunt` command
- Your bot should now be connected and an admin page should be available at the address : `http://localhost:3220/admin`
- Register the following env vars : DB_USER, DB_PASS, ADMIN_USER, ADMIN_PASS, SLACK_TOKEN, SLACK_BOT, SLACK_CURRENCY

#### Slack-bill-sharing functionalities

- Start by adding users with `@botName add username`
- At anytime, you can consult the list of users with `@botName team` and remove a user with `@botName remove username`
- Add expenses by using one of the following commands `@botName adrien paid 10` or `@botName john paid 35 to sandy roger`.
- Check balances with the command `@botName report`