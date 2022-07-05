import styles from './home.module.scss';
import commonStyles from "../styles/common.module.scss";
import { AiOutlineCalendar, AiOutlineUser } from "react-icons/ai";
import { GetStaticProps } from 'next';
import { createClient } from '../services/prismic';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({postsPagination}: HomeProps) {
  const [loadPosts, setLoadPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleLoadMorePosts() {
    
    const response = await fetch(nextPage).then(res => res.json());

    setNextPage(response.next_page);

    const newPosts = response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setLoadPosts([...loadPosts, ...newPosts])
  }

  return(
    <>
      <article className={`${styles.container} ${commonStyles.contentContainer}`}>
        {loadPosts.map(post => (
          <section key={post.uid} className={styles.content}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>

            <div className={styles.infoContainer}>
              <div>
                <AiOutlineCalendar/>
                <time>
                  {
                     format(new Date(post.first_publication_date), "dd MMM yyyy", { locale: ptBR })
                  }
                </time>
              </div>

              <div>
                <AiOutlineUser/>
                <span>{post.data.author}</span>
              </div>
            </div>
          </section>
        ))}

        {
          nextPage && <button className={styles.loadMore} onClick={handleLoadMorePosts}>Carregar mais</button> || ""
        }

      </article>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient();

  const response = await client.getByType('post', {
    pageSize: 1,
  })

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  console.log(response.next_page)

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      }
    },
    revalidate: 60 * 30 // 30 minutes
  }
};
