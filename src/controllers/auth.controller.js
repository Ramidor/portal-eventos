const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creando usuario" });
  }
};