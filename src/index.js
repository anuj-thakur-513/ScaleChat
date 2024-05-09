const { server } = require("./service/socket");

const PORT = process.env.PORT || 8000;

const init = async () => {
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

init();
