
import bcrypt from "bcrypt";
import { handleError } from "../utils/handleError.js";
import User from "./User.js";
import Post from "../posts/Posts.js";

export const getUsers = async (req, res) => {

    try {
        //Pagination

        const pageElements = req.query.limit;
        const actualPage = req.query.page;
        const skip = (actualPage - 1) * pageElements;

        //Retrieve data
        const userRole = req.tokenData.roleName;
        //Filter
        const queryFilters = {}

        if (req.query.firstName) {
            queryFilters.firstName = new RegExp(req.query.firstName);   
        }
        if (req.query.lastName) {
            queryFilters.lastName = new RegExp(req.query.lastName);
        }
        if (req.query.email) {
            queryFilters.email = new RegExp(req.query.email);
        }

        //Retrieve public users
        if (userRole !== "super-admin") {
            const userPublic = await User
                .find(queryFilters)
                .select('-password -createdAt -updatedAt')
                .skip(skip)
                .limit(pageElements);

            return res.status(200).json({
                success: true,
                message: "all publics users retrieved",
                data: userPublic
            })
        }

        const users = await User
            .find(queryFilters)
            .select('-password -createdAt -updatedAt')
            .skip(skip)
            .limit(pageElements);

        if (!users) {
            throw new Error("Any user found to retireve")
        }

        return res.status(200).json({
            success: true,
            message: "all users retrieved",
            data: users
        })

    } catch (error) {
        if (error.message === "Any user found to retireve") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant retrieve any user", 500)
    }
}

export const getUserProfile = async (req, res) => {

    try {
        const userId = req.tokenData.userId

        const user = await User
            .findById(userId)
            .select('-password -createdAt -updatedAt')
            .populate("following", "firstName lastName image _id")
            .populate("follower", "firstName lastName image _id");

        if (!user) {
            throw new Error("Any user found to retireve")
        }

        res.status(200).json({
            success: true,
            message: "User retrieved",
            data: user
        })

    } catch (error) {
        if (error.message === "Any user found to retireve") {
            return handleError(res, error.message, 400)
        }
        // if (error.message === "JWT NOT VALID OR MALFORMED") {
        //     return handleError(res, error.message, 400)
        // }

        handleError(res, "Cant retrieve any user", 500)
    }
}

export const getUserProfileById = async (req, res) => {

    try {
        const userId = req.tokenData.userId
        const userIdToBring = req.params.userId


        const user = await User
            .findById(userIdToBring)
            .select('-password -createdAt -updatedAt')
        if (!user) {
            throw new Error("Any user found to retireve")
        }

        res.status(200).json({
            success: true,
            message: "User retrieved",
            data: user
        })

    } catch (error) {
        if (error.message === "Any user found to retireve") {
            return handleError(res, error.message, 400)
        }
        // if (error.message === "JWT NOT VALID OR MALFORMED") {
        //     return handleError(res, error.message, 400)
        // }

        handleError(res, "Cant retrieve any user", 500)
    }
}

export const updateUserProfile = async (req, res) => {

    try {
        const userId = req.tokenData.userId
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let image = req.body.image

        const exist = await User.findOne(
            {
                _id: userId,
            }
        )

        if (!firstName && !lastName && !email) {
            throw new Error("You should to introuce any data to update")
        }

        if (!firstName) {
            firstName = exist.firstName
        }

        if (!lastName) {
            lastName = exist.lastName
        }

        if (!image) {
            lastName = exist.image
        }

        if (firstName.length > 50) {

            return res.status(400).json({
                succes: false,
                message: "First name too large"
            })
        }

        if (lastName.length > 50) {

            return res.status(400).json({
                succes: false,
                message: "Last name too large"
            })
        }

        const userUpdated = await User.findOneAndUpdate(
            {
                _id: userId
            },
            {
                firstName,
                lastName,
                image,
            },
            {
                new: true
            },
        )
            .select('-_id -password -createdAt -updatedAt')

        res.status(200).json({
            success: true,
            message: "User updated",
            data: userUpdated
        })

    } catch (error) {
        if (error.message === "You should to introuce any data to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Email format is not valid") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant update any propery", 500)
    }
}

export const deleteUserById = async (req, res) => {

    try {
        const userToRemove = req.params.id
        const userLoged = req.tokenData.userId
        const roleLoged = req.tokenData.roleName

        if ((userLoged !== userToRemove) && (roleLoged !== "super-admin") && (roleLoged !== "admin")) {
            throw new Error("You dont have permitions to modidy this role")
        }
        if ((userLoged === userToRemove)) {
            throw new Error("You dont have permitions to modidy this role")
        }


        const userDeleted = await User.findOneAndDelete(
            {
                _id: userToRemove
            }
        )
            .select('-_id -password -createdAt -updatedAt')

        if (!userDeleted) {
            throw new Error("Any user found to update")
        }

        return res.status(200).json({
            success: true,
            message: "User deleted",
            data: userDeleted
        })

    } catch (error) {
        if (error.message === "Any user found to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "You dont have permitions to modidy this role") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant delete this user", 500)
    }
}

export const updateUserRole = async (req, res) => {

    try {

        const role = req.body.role
        const userToModify = req.params.id

        if (!role) {
            throw new Error("You should to introuce any data to update")
        }
        if (role !== "user" && role !== "admin" && role !== "super-admin") {
            throw new Error("The role provided its wrong")
        }

        const userUpdated = await User.findOneAndUpdate(
            {
                _id: userToModify
            },
            {
                role
            },
            {
                new: true
            },
        )
            .select('-_id -password -createdAt -updatedAt')

        if (!userUpdated) {
            throw new Error("Any user found to update")
        }

        return res.status(200).json({
            success: true,
            message: "User updated",
            data: userUpdated
        })

    } catch (error) {
        if (error.message === "You should to introuce any data to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "You dont have permitions to modidy this role") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Any user found to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "The role provided its wrong") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant update any propery", 500)
    }
}

export const getPostByUserId = async (req, res) => {

    try {
        const userId = req.params.userId

        const posts = await Post
            .find({ userId: userId })
            .select("-userId -updatedAt")
            .populate('userId', 'firstName lastName image follower following')


        if (posts.length === 0) {
            throw new Error("Any post to retrieve")
        }

        res.status(200).json({
            success: true,
            message: "Post retrieved succesfully",
            data: posts
        })

    } catch (error) {
        if (error.message === "Any post to retrieve") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant rerieve any post", 500)
    }
}

export const followUserById = async (req, res) => {

    try {

        const userToFollowId = req.params.userId;
        const userFollowerId = req.tokenData.userId;

        if (!userToFollowId) {
            throw new Error("You should to introuce user to follow")
        }

        const userFollowerUpdated = await User.findOne(
            {
                _id: userFollowerId
            }
        ).populate('following', 'firstName')

        const userToFollowUpdated = await User.findOne(
            {
                _id: userToFollowId
            },
        ).populate('follower', 'firstName')

        for (let i = 0; i < userToFollowUpdated.follower.length; i++) {

            if (userToFollowUpdated.follower[i]._id.toString() === userFollowerId) {

                const userFollowerUpdated = await User.findOneAndUpdate(
                    { _id: userFollowerId },
                    { $pull: { following: userToFollowId } },
                    { new: true }
                ).populate('following', 'firstName');

                const userToFollowUpdated = await User.findOneAndUpdate(
                    { _id: userToFollowId },
                    { $pull: { follower: userFollowerId } },
                    { new: true }
                ).populate('follower', 'firstName');

                return res.status(200).json({
                    success: true,
                    message: "User successfully unfollowed",
                    data: { userToFollowUpdated, userFollowerUpdated }
                });
            }
        }

        const userFollowerUpdated2 = await User.findOneAndUpdate(
            { _id: userFollowerId },
            { $addToSet: { following: userToFollowId } },
            { new: true }
        ).populate('following', 'firstName');

        const userToFollowUpdated2 = await User.findOneAndUpdate(
            { _id: userToFollowId },
            { $addToSet: { follower: userFollowerId } },
            { new: true }
        ).populate('follower', 'firstName');

        return res.status(200).json({
            success: true,
            message: "User successfully followed",
            data: { userToFollowUpdated2, userFollowerUpdated2 }
        });

    } catch (error) {
        if (error.message === "You should to introuce any data to update") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "You already follow this user") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "You dont have permitions to modidy this role") {
            return handleError(res, error.message, 400)
        }
        if (error.message === "Any user found to update") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant update any propery", 500)
    }
}

export const getFollowers = async (req, res) => {

    try {
        //Retrieve data
        const userId = req.tokenData.userId
        let usersFollowers = [];
        let usersFollowersFinal = [];

        const user = await User
            .find()
            .select('-password -createdAt -updatedAt')


        const user2 = await User
            .findById(userId)
            .select('-password -createdAt -updatedAt')

        for (let i = 0; i < user.length; i++) {

            for (let j = 0; j < user[i].following.length; j++) {

                if (user[i].following[j].equals(user2._id)) {

                    usersFollowers.push(user[i]._id.toString())
                }
            }
        }


        for (let i = 0; i < usersFollowers.length; i++) {
            const user3 = await User
                .findById(usersFollowers[i])
                .select('-id -email -role -public -password -createdAt -updatedAt')

            usersFollowersFinal.push(user3)
        }

        return res.status(200).json({
            success: true,
            message: "all users retrieved",
            data: usersFollowersFinal
        })

    } catch (error) {
        if (error.message === "Any user found to retireve") {
            return handleError(res, error.message, 400)
        }

        handleError(res, "Cant retrieve any user", 500)
    }
}