const cycleQueryKeys = [
  ['calendar'],
  ['calendar-day'],
  ['periods'],
  ['next-cycle'],
  ['home'],
  ['summary']
];

export const refreshCycleQueries = async (queryClient) => {
  await Promise.all(
    cycleQueryKeys.map((queryKey) =>
      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'active'
      })
    )
  );
};
