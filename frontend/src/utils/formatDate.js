export const formatDate = (value) => {
  if (!value) return "Not set";
  return new Date(value).toLocaleString();
};
