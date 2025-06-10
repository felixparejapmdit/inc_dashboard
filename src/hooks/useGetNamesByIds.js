const useGetNamesByIds = () => {
  const getNamesByIds = (idsInput, array, nameField = "name") => {
    if (!idsInput || !Array.isArray(array)) return "N/A";

    const idsString =
      typeof idsInput === "string" ? idsInput : String(idsInput);

    const ids = idsString.split(",").map((id) => parseInt(id.trim(), 10));

    const names = ids
      .map((id) => {
        const match = array.find((entry) => entry.id === id);
        return match ? match[nameField] : null;
      })
      .filter(Boolean);

    return names.length ? names.join(", ") : "N/A";
  };

  return { getNamesByIds };
};

export default useGetNamesByIds;
