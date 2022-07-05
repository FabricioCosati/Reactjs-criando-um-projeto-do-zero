
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';
import { createClient } from '../../services/prismic';

import { format } from "date-fns"
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  
  const words = post.data.content.reduce((acc: number, cur) => {
    const heading = cur.heading.split(' ').length;
    
    const body = cur.body.reduce((acc: number, cur) => {
      const text = cur.text.split(' ').length;
      acc += text;
      return acc;
    }, 0)

    const sum = heading + body;
    acc += sum;

    return acc
  }, 0);

  const timeToRead = Math.ceil(words / 200);

  return (
    <>
      <div className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt="logo" />
      </div>

      <main className={`${styles.contentContainer} ${commonStyles.contentContainer}`}>
        <header>
          <h1>{post.data.title}</h1>
          <div className={styles.headerContainer}>
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

            <div>
              <AiOutlineClockCircle/>
              <span>{timeToRead} min</span>
            </div>
          </div>
        </header>

        <article className={styles.bodyContent}>
          {
            post.data.content.map(content => {
              return (
                <section key={content.heading}>
                  <h2>{content.heading}</h2>
                  <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}></div>
                </section>
              )
            })
          }
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async() => {
  const client = createClient();

  return {
    paths: [],
    fallback: 'blocking'
  }


}

export const getStaticProps: GetStaticProps = async ({params}) => {
  const client = createClient();

  const response = await client.getByUID('post', String(params.slug))

  const data = response.data.content.map(content => {
    return {
      heading: content.heading,
      body: content.body
    }
  })


  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: data
    }
  }

  return {
    props: {
      post
    }
  }
}
