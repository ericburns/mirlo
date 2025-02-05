import { css } from "@emotion/css";
import Button from "components/common/Button";
import { MetaCard } from "components/common/MetaCard";
import parse from "html-react-parser";
import React from "react";
import { useTranslation } from "react-i18next";
import { FaPen } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useGlobalStateContext } from "state/GlobalState";
import usePublicObjectById from "utils/usePublicObjectById";
import { bp } from "../../constants";
import Box from "components/common/Box";
import FollowArtist from "components/common/FollowArtist";
import SpaceBetweenDiv from "components/common/SpaceBetweenDiv";
import LoadingBlocks from "components/Artist/LoadingBlocks";
import SupportArtistPopUp from "components/common/SupportArtistPopUp";
import Avatar from "components/Artist/Avatar";
import styled from "@emotion/styled";
import MarkdownWrapper from "components/common/MarkdownWrapper";

export const PageMarkdownWrapper = styled.div`
  width: 100%;
  margin-top: 2rem;
  max-width: var(--mi-container-medium);
  margin: auto;
  padding: var(--mi-side-paddings-xsmall);
  font-size: 18px;
  line-height: 1.7rem;

  blockquote {
    direction: ltr;
    font-style: italic;
    padding-left: 1rem;
    border-left: solid 3px grey;
    unicode-bidi: isolate;
    margin-bottom: 1.5rem;
  }

  a {
    word-break: break-word;
  }

  h1 {
    font-weight: normal !important;
  }

  h2 {
    font-weight: normal !important;
    font-size: 1.7rem !important;
    margin-top: 1rem;
    margin-bottom: 1rem !important;
  }

  h3 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 0;
  }

  p {
    line-height: 1.7rem !important;
  }

  iframe {
    margin: 0 !important;
  }

  ul {
    margin-left: 1rem;
    margin-bottom: 1rem;
    line-height: 1.7rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  @media (max-width: ${bp.medium}px) {
    p {
      line-height: 1.6rem !important;
    }
  }
`;

const Post: React.FC = () => {
  const { t } = useTranslation("translation", { keyPrefix: "post" });

  const {
    state: { user },
  } = useGlobalStateContext();
  const { postId } = useParams();
  const { object: post, isLoadingObject } = usePublicObjectById<Post>(
    "posts",
    postId
  );

  if (!post) {
    if (!isLoadingObject) {
      return <Box>No post found</Box>;
    }
    return <LoadingBlocks rows={1} />;
  }

  const ownedByUser = post.artist?.userId === user?.id;

  return (
    <PageMarkdownWrapper>
      <MetaCard
        title={`${post.title} by ${post.artist?.name}`}
        description={post.content.slice(0, 500)}
      />
      <div
        className={css`
          margin-top: 2rem;
          display: flex;
          justify-content: center;
          width: 100%;
          h1 {
            margin-bottom: 0.5rem;
          }

          @media (min-width: ${bp.medium}px) {
            font-size: 1.2rem;
            font-weight: 100;
            line-height: 1.5rem;
          }
        `}
      >
        <div
          className={css`
            flex: 100%;
            max-width: 700px;
          `}
        >
          <div
            className={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            <h1>{post.title}</h1>
            {(ownedByUser || user?.isAdmin) && (
              <Link to={`/manage/artists/${post.artistId}/post/${post.id}`}>
                <Button variant="dashed" startIcon={<FaPen />}>
                  {t("edit")}
                </Button>
              </Link>
            )}
          </div>
          {post.artist && (
            <SpaceBetweenDiv
              className={css`
                padding-bottom: 2rem !important;
                padding-top: 0.5rem;
              `}
            >
              <span
                className={css`
                  margin-right: 0.25rem;
                  display: flex;
                  line-height: 2.2rem;

                  a {
                    display: inline-flex;
                    align-items: center;
                    margin-left: 0.35rem;
                  }

                  img {
                    margin-right: 0.2rem;
                    max-width: 25px;
                  }
                `}
              >
                by{" "}
                <Link
                  to={`/${post.artist.urlSlug?.toLowerCase() ?? post.artistId}`}
                >
                  <Avatar avatar={post.artist.avatar?.sizes?.[60]} />
                  <span>{post.artist?.name}</span>
                </Link>
              </span>
              {post.artistId && <FollowArtist artistId={post.artistId} />}
            </SpaceBetweenDiv>
          )}
          {post.isContentHidden && (
            <div
              className={css`
                padding: 2rem 0;
              `}
            >
              {t("notAvailable")}
            </div>
          )}
          {!post.isContentHidden && (
            <MarkdownWrapper>{parse(post.content)}</MarkdownWrapper>
          )}
        </div>
      </div>
      {post.artist && (
        <div
          className={css`
            text-align: center;
          `}
        >
          <SupportArtistPopUp artist={post.artist} />
        </div>
      )}
    </PageMarkdownWrapper>
  );
};

export default Post;
