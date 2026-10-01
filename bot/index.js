require("dotenv").config({ path: "./bot/.env" });

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// =========================
// SLASH COMMAND
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem your DragoClient license")
    .addStringOption((option) =>
      option
        .setName("license")
        .setDescription("Your DragoClient license key")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

// =========================
// REGISTER COMMAND
// =========================

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN
);

async function registerCommands() {
  try {
    console.log("Registering /redeem...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("✅ /redeem registered");
  } catch (error) {
    console.error("❌ Failed to register command:");
    console.error(error);
  }
}

// =========================
// BOT READY
// =========================

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// =========================
// /redeem
// =========================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName !== "redeem") return;

  const licenseKey = interaction.options.getString("license", true);

  await interaction.deferReply({
    ephemeral: true,
  });

  try {
    const response = await fetch(
      `${process.env.DRAGO_API_URL}/api/discord/redeem`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DISCORD_ADMIN_SECRET}`,
        },
        body: JSON.stringify({
          licenseKey,
          discordUserId: interaction.user.id,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      await interaction.editReply(
        `❌ ${data.error || "Failed to redeem license."}`
      );
      return;
    }

    const role = interaction.guild.roles.cache.get(
      process.env.DISCORD_ROLE_ID
    );

    if (!role) {
      await interaction.editReply(
        "❌ DragoClient role was not found."
      );
      return;
    }

    const member = await interaction.guild.members.fetch(
      interaction.user.id
    );

    await member.roles.add(role);

    await interaction.editReply(
      "✅ **License redeemed!**\n\n" +
        "You now have access to **DragoClient**.\n" +
        "The download channel should now be visible."
    );
  } catch (error) {
    console.error(error);

    await interaction.editReply(
      "❌ Something went wrong while redeeming your license."
    );
  }
});

// =========================
// START
// =========================

async function start() {
  await registerCommands();

  await client.login(process.env.DISCORD_TOKEN);
}

start();