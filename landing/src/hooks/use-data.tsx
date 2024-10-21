import { useQuery } from "@tanstack/react-query";
import { execute } from "./gql";
import { GET_USERS } from "./query/players";

export function useData() {
  console.log(GET_USERS.toString());
  const { data } = useQuery({
    queryKey: ["number-of-players"],
    queryFn: () => execute(GET_USERS),
  });

  return {
    data,
  };
}
