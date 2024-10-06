import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  Button,
  Textarea,
  VStack,
  Image,
  Text,
  IconButton,
  Divider,
  HStack,
  Heading,
  Container,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { FiUpload, FiSend, FiHeart, FiMessageSquare } from "react-icons/fi";

// Function to initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("PMDMediaDB", 1);
    request.onupgradeneeded = function () {
      const db = request.result;
      if (!db.objectStoreNames.contains("media")) {
        db.createObjectStore("media", { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to open IndexedDB");
  });
};

// Function to store media in IndexedDB
const storeMedia = (media) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction("media", "readwrite");
    const store = transaction.objectStore("media");
    const id = new Date().getTime();
    const request = store.add({ id, media });

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject("Failed to store media in IndexedDB");
  });
};

// Function to retrieve media from IndexedDB
const getMedia = (id) => {
  return new Promise(async (resolve, reject) => {
    const db = await initDB();
    const transaction = db.transaction("media", "readonly");
    const store = transaction.objectStore("media");
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result?.media || null);
    request.onerror = () => reject("Failed to retrieve media from IndexedDB");
  });
};

const Mastodon = () => {
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaProgress, setMediaProgress] = useState(0);
  const [posts, setPosts] = useState(() => {
    const savedPosts = localStorage.getItem("posts");
    return savedPosts ? JSON.parse(savedPosts) : [];
  });
  const [likedPosts, setLikedPosts] = useState([]); // To track liked posts
  const [likedComments, setLikedComments] = useState([]); // To track liked comments
  const [currentUser, setCurrentUser] = useState(null); // Store the logged-in user
  const [comment, setComment] = useState("");
  const [commentingOn, setCommentingOn] = useState(null);
  const [replyingToComment, setReplyingToComment] = useState(null); // For replying to comments
  const toast = useToast();

  useEffect(() => {
    // Fetch current user from the new API endpoint
    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then((response) => response.json())
      .then((users) => {
        const loggedInUser = users.find((user) => user.isLoggedIn);
        setCurrentUser(loggedInUser);
      })
      .catch((error) => console.error("Error fetching user data:", error));
  }, []);

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadstart = () => setMediaProgress(0); // Start progress at 0%
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setMediaProgress(progress);
      }
    };
    reader.onloadend = async () => {
      const mediaId = await storeMedia(reader.result); // Store media in IndexedDB
      setMedia(mediaId); // Save the mediaId
      toast({
        title: "Media uploaded!",
        description: "Your media has been uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!currentUser) {
      alert("No user logged in!");
      return;
    }

    if (message || media) {
      const newPost = {
        id: new Date().getTime(),
        user: currentUser, // Add the logged-in user data to the post
        message,
        media,
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
      };
      setPosts([newPost, ...posts]);
      setMessage("");
      setMedia(null);
      setMediaProgress(0); // Reset progress after posting
    }
  };

  const handleLike = (id, type = "post", parentId = null) => {
    if (type === "post") {
      if (likedPosts.includes(id)) return; // Prevent multiple likes
      const updatedPosts = posts.map((post) =>
        post.id === id ? { ...post, likes: post.likes + 1 } : post
      );
      setPosts(updatedPosts);
      setLikedPosts([...likedPosts, id]); // Track liked posts
    } else if (type === "comment") {
      if (likedComments.includes(id)) return; // Prevent multiple likes on comments
      const updatedPosts = posts.map((post) =>
        post.id === parentId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === id
                  ? { ...comment, likes: comment.likes + 1 }
                  : comment
              ),
            }
          : post
      );
      setPosts(updatedPosts);
      setLikedComments([...likedComments, id]); // Track liked comments
    }
  };

  const handleCommentSubmit = (id, parentId = null) => {
    if (!currentUser) {
      alert("No user logged in!");
      return;
    }

    const newComment = {
      id: new Date().getTime(),
      user: currentUser,
      message: comment,
      likes: 0,
      comments: [], // Initialize comments array for nested comments
      timestamp: new Date().toISOString(),
    };

    const updatedPosts = posts.map((post) => {
      if (post.id === id) {
        if (parentId) {
          return {
            ...post,
            comments: post.comments.map((comment) =>
              comment.id === parentId
                ? { ...comment, comments: [...comment.comments, newComment] }
                : comment
            ),
          };
        } else {
          return { ...post, comments: [...post.comments, newComment] };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    setComment("");
    setCommentingOn(null);
    setReplyingToComment(null);
  };

  return (
    <Box bgGradient="linear(to-r, blue.50, purple.50)" minH="100vh" py={10}>
      {/* Header */}
      <Container maxW="container.lg" textAlign="center" mb={8}>
        <Heading as="h1" size="2xl" color="blue.800" mb={4}>
          PMD Social Media
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Share your thoughts, images, and videos.
        </Text>
      </Container>

      <Box
        bg="white"
        p={6}
        borderRadius="md"
        boxShadow="lg"
        maxW="600px"
        mx="auto"
        mb={8}
        position="relative"
        _hover={{ transform: "scale(1.02)" }}
        transition="transform 0.3s"
      >
        {/* Post input form */}
        <Textarea
          placeholder="What's on your mind?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          mb={4}
          borderColor="gray.300"
        />
        {mediaProgress > 0 && (
          <Progress value={mediaProgress} size="xs" colorScheme="blue" mb={4} />
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* Media Upload Button */}
          <label htmlFor="media-upload">
            <IconButton
              as="span"
              icon={<FiUpload />}
              colorScheme="blue"
              size="lg"
              mr={2}
            />
          </label>
          <Input
            type="file"
            id="media-upload"
            accept="image/*,video/*"
            display="none"
            onChange={handleMediaUpload}
          />

          {/* Post Button */}
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handlePost}
            leftIcon={<FiSend />}
          >
            Post
          </Button>
        </Box>
      </Box>

      {/* Display list of posts */}
      <VStack spacing={6} width="100%" maxWidth="600px" mx="auto">
        {posts.map((post) => (
          <Box
            key={post.id}
            bg="white"
            p={6}
            borderRadius="md"
            boxShadow="md"
            width="100%"
            _hover={{ boxShadow: "xl" }}
            transition="all 0.3s ease"
          >
            <HStack>
              {post.user && post.user.avatar ? (
                <Image
                  borderRadius="full"
                  boxSize="40px"
                  src={post.user.avatar}
                  alt={post.user.name}
                />
              ) : (
                <Image
                  borderRadius="full"
                  boxSize="40px"
                  src="/default-avatar.jpg"
                  alt="Default Avatar"
                />
              )}
              <Text fontSize="md" fontWeight="bold">
                {post.user ? post.user.name : "Anonymous"}
              </Text>
            </HStack>

            <Text fontSize="lg" mt={2} mb={2} fontWeight="bold">
              {post.message}
            </Text>

            {/* Display image or video if available */}
            {post.media && <PostMedia mediaId={post.media} />}

            <Text fontSize="sm" color="gray.500">
              {new Date(post.timestamp).toLocaleString()}
            </Text>

            {/* Like and Comment Buttons */}
            <HStack spacing={4} mt={4}>
              <Button
                size="sm"
                colorScheme="pink"
                leftIcon={<FiHeart />}
                onClick={() => handleLike(post.id)}
                isDisabled={likedPosts.includes(post.id)} // Disable like button if already liked
              >
                Like ({post.likes})
              </Button>
              <Button
                size="sm"
                colorScheme="gray"
                leftIcon={<FiMessageSquare />}
                onClick={() => setCommentingOn(post.id)}
              >
                Comment ({post.comments.length})
              </Button>
            </HStack>

            {/* Comment Input */}
            {commentingOn === post.id && (
              <Box mt={4}>
                <Textarea
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  mb={2}
                  borderColor="gray.300"
                />
                <Button
                  colorScheme="blue"
                  onClick={() => handleCommentSubmit(post.id)}
                >
                  Submit Comment
                </Button>
              </Box>
            )}

            {/* Display Comments */}
            {post.comments.length > 0 && (
              <>
                <Divider my={4} />
                <Text fontSize="md" fontWeight="bold">
                  Comments
                </Text>
                {post.comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    onLike={handleLike}
                    handleCommentSubmit={handleCommentSubmit}
                    replyingToComment={replyingToComment}
                    setReplyingToComment={setReplyingToComment}
                  />
                ))}
              </>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const PostMedia = ({ mediaId }) => {
  const [media, setMedia] = useState(null);

  useEffect(() => {
    const fetchMedia = async () => {
      const result = await getMedia(mediaId);
      setMedia(result);
    };
    fetchMedia();
  }, [mediaId]);

  if (!media) return null;

  return media.startsWith("data:video") ? (
    <video controls width="100%" style={{ borderRadius: "8px" }}>
      <source src={media} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  ) : (
    <Image src={media} alt="Uploaded media" borderRadius="lg" mb={4} />
  );
};

const Comment = ({
  comment,
  postId,
  onLike,
  handleCommentSubmit,
  replyingToComment,
  setReplyingToComment,
}) => {
  const [commentReply, setCommentReply] = useState("");

  return (
    <Box mt={4} pl={4} borderLeft="2px solid gray">
      <HStack>
        {comment.user && comment.user.avatar ? (
          <Image
            borderRadius="full"
            boxSize="30px"
            src={comment.user.avatar}
            alt={comment.user.name}
          />
        ) : (
          <Image
            borderRadius="full"
            boxSize="30px"
            src="/default-avatar.jpg"
            alt="Default Avatar"
          />
        )}
        <Text fontSize="sm" fontWeight="bold">
          {comment.user ? comment.user.name : "Anonymous"}
        </Text>
      </HStack>
      <Text>{comment.message}</Text>
      <Text fontSize="sm" color="gray.500">
        {new Date(comment.timestamp).toLocaleString()}
      </Text>
      <HStack spacing={4} mt={2}>
        <Button
          size="xs"
          colorScheme="pink"
          leftIcon={<FiHeart />}
          onClick={() => onLike(comment.id, "comment", postId)}
          isDisabled={replyingToComment && replyingToComment === comment.id} // Disable if already replied
        >
          Like ({comment.likes || 0})
        </Button>
        <Button
          size="xs"
          colorScheme="gray"
          leftIcon={<FiMessageSquare />}
          onClick={() => setReplyingToComment(comment.id)}
        >
          Reply
        </Button>
      </HStack>

      {/* Nested comment input */}
      {replyingToComment === comment.id && (
        <Box mt={4} pl={4}>
          <Textarea
            size="sm"
            placeholder="Write a reply..."
            value={commentReply}
            onChange={(e) => setCommentReply(e.target.value)}
            mb={2}
            borderColor="gray.300"
          />
          <Button
            size="sm"
            colorScheme="blue"
            onClick={() => {
              handleCommentSubmit(postId, comment.id);
              setCommentReply("");
              setReplyingToComment(null);
            }}
          >
            Submit Reply
          </Button>
        </Box>
      )}

      {/* Display nested comments */}
      {comment.comments && comment.comments.length > 0 && (
        <VStack spacing={2} mt={4} pl={4} align="start">
          {comment.comments.map((nestedComment) => (
            <Comment
              key={nestedComment.id}
              comment={nestedComment}
              postId={postId}
              onLike={onLike}
              handleCommentSubmit={handleCommentSubmit}
              replyingToComment={replyingToComment}
              setReplyingToComment={setReplyingToComment}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Mastodon;
