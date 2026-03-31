export const generateUsername = (
  ime: string,
  prezime: string,
  existingUsernames: string[]
) => {

  const removeDiacritics = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "");

  const cleanIme = removeDiacritics(ime).toLowerCase();
  const cleanPrezime = removeDiacritics(prezime).toLowerCase();

  let baseUsername = `${cleanIme}.${cleanPrezime}`;
  let username = baseUsername;
  let counter = 1;

  while (existingUsernames.includes(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};