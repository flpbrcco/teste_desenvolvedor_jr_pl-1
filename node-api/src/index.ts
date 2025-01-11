/* Inicia o servidor */
import dotenv from 'dotenv';
dotenv.config();
import app from './app';

const PORT = 3005;

app.listen(PORT, () => {
  console.log(`Node API rodando na porta ${PORT}`);
});
