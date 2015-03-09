# slack-bill-sharing

Slack-bill-sharing is a bill sharing bot for slack.

![alt tag](https://raw.githubusercontent.com/gsellator/slack-bill-sharing/master/public/img/example.png)

## Getting Started

#### Creating a new bot

- Create a bot on [slack's website](https://my.slack.com/services/new/bot)
- Change the name of the `.ftppass-` file into `.ftppass` and fill it with your own token and bot name
- Install the project dependencies with `npm install`
- Run the project locally with the `grunt` command
- Your bot should now be connected and an admin page should be available at the address : `http://localhost:3220/admin`

#### Slack-bill-sharing functionalities

- Start by adding users with `@botName add username`
- At anytime, you can consult the list of users with `@botName team` and remove a user with `@botName remove username`
- Add expenses by using one of the following commands `@botName adrien paid 10` or `@botName john paid 35 to sandy roger`.
- Check balances with the command `@botName report`