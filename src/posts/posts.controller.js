
import { handleError } from "../utils/handleError.js";
import User from "../users/User.js";
import Post from "./Posts.js";

export const createPost = async (req, res) => {

    try {

        //Retrive data
        const userId = req.tokenData.userId
        const title = req.body.title
        const description = req.body.description

        const user = await User.findById(userId)

        //Password validation


        //Create in data base
        const newPost = await Post.create({
            title,
            description,
            userId: user._id
        })

        //Data response
        const printDescription = {
            title: newPost.title,
            description: newPost.description,
            user: newPost.userId,
        }

        //Response
        res.status(201).json({
            success: true,
            message: "User registered succesfully",
            data: printDescription
        })

    } catch (error) {

        if (error.message === "Password must contain between 6 and 10 characters") {
            return handleError(res, error.message, 400)
        }

        if (error.message === "format email invalid") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant create post", 500)
    }
}

export const deletePostById = async (req, res) => {

    try {
        const postId = req.params.id
        const userId = req.tokenData.userId

        const post = await Post.findById(postId)

        if (!post) {
            throw new Error("Any post to delete")
        }

        if (userId !== post.userId) {
            throw new Error("Cant delete another person post")
        }

        const postToDelete = await Post.findOneAndDelete(
            {
                _id: postId
            }
        )

            .select('-_id -description -updatedAt')


        if (!postToDelete) {
            throw new Error("Any post to update")
        }

        res.status(200).json({
            success: true,
            message: "Post deleted",
            data: postToDelete
        })

    } catch (error) {
        if (error.message === "Any post to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Cant modificate another person post") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant delete any post", 500)
    }
}

export const updatePostById = async (req, res) => {

    try {
        const userId = req.tokenData.userId
        const postId = req.params.id

        const title = req.body.title
        const description = req.body.description

        const post = await Post.findById(postId)

        if (!title && !description) {
            throw new Error("You should to introuce any data to update")
        }

        if (!post) {
            throw new Error("Any post to update")
        }

        if (userId !== post.userId) {
            throw new Error("Cant modificate another person post")
        }

        const postUpdated = await Post.findOneAndUpdate(
            {
                _id: postId
            },
            {
                title,
                description
            },
            {
                new: true
            },
        )
            .select('-_id -userId -createdAt ')

        res.status(200).json({
            success: true,
            message: "User updated",
            data: postUpdated
        })

    } catch (error) {
        if (error.message === "You should to introuce any data to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Cant modificate another person post") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Any post to update") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant update any post", 500)
    }
}

export const getUserPosts = async (req, res) => {

    try {

        const userId = req.tokenData.userId

        const userPosts = await Post
            .find({userId:userId})
            .select('-_id -password -createdAt -updatedAt')

        console.log(userPosts)

        if (!userPosts) {
            throw new Error("Any user found to retireve")
        }

        res.status(200).json({
            success: true,
            message: "User retrieved",
            data: userPosts
        })

    } catch (error) {
        if (error.message === "Any user found to retireve") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant retrieve any book", 500)
    }
}

export const getPosts = async (req, res) => {

    try {

        const userId = req.tokenData.userId

        const posts = await Post
            .find()
            .select('-_id -password -createdAt -updatedAt')

        if (!posts) {
            throw new Error("Any post found to retireve")
        }

        res.status(200).json({
            success: true,
            message: "User retrieved",
            data: posts
        })

    } catch (error) {
        if (error.message === "Any post found to retireve") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant retrieve any book", 500)
    }
}


export const getPostById = async (req, res) => {

    try {
        const postId = req.params.id
        const userId = req.tokenData.userId

        const post = await Post.findById(postId)

        if (!post) {
            throw new Error("Any post to retrieve")
        }

        if (userId !== post.userId) {
            throw new Error("Cant retrieve another person post")
        }

        res.status(200).json({
            success: true,
            message: "Post retrieved succesfully",
            data: post
        })

    } catch (error) {
        if (error.message === "Any post to retrieve") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Cant retrieve another person post") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant rerieve any post", 500)
    }
}    


export const postLike = async (req, res) => {
                                                                                                                                          
    try {
   
        const postId = req.params.id

        let like;

        const post = await Post.findById(postId)
        
        post.like === true ? like = false : like = true       
        // const post = await Post.findById(postId)

        const postUpdated = await Post.findOneAndUpdate(
            {
                _id: postId
            },
            {
                like,
            },
            {
                new: true
            },
        )
            .select('-_id -userId -createdAt ')

        res.status(200).json({
            success: true,
            message: "User updated",
            data: postUpdated
        })

    } catch (error) {
        if (error.message === "You should to introuce any data to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Cant modificate another person post") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Any post to update") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant update any post", 500)
    }
}
