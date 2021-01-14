import { CheckCircleIcon, LinkIcon } from '@chakra-ui/icons'
import { withUrqlClient } from 'next-urql';
import { Navbar } from '../components/Navbar';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
  const [{ data }] = usePostsQuery();
  console.log(data);

  return (
    <>
      <Navbar />
      <div>Hello</div>
      {
        !data ? null : data.posts.map((d) => <p key={d.id}>{d.title}</p>)
      }
    </>
  )
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
