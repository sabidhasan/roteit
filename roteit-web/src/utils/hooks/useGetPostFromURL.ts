import { useRouter } from "next/router";
import { usePostQuery } from "../../generated/graphql";

export const useGetPostFromURL = () => {
  const router = useRouter();
  const invalidURLParam = typeof router.query.id !== 'string';
  return {
    postOptions: usePostQuery({
      pause: invalidURLParam,
      variables: { id: Number(router.query.id) },
    }),
    postId: Number(router.query.id),
  };
};
