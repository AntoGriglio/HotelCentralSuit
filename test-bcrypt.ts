import bcrypt from 'bcrypt';

const password = 'Prueba1234';

bcrypt.hash(password, 10).then((hash) => {
  console.log('Nuevo hash generado:', hash);
});
