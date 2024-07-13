const { Op } = require("sequelize");
const User = require("../models/User");
const Request = require("../models/Request");

exports.sendRequest = async (req, res) => {
  try {
    const { senderUID, receiverUID } = req.body;

    const senderExists = await User.findOne({ where: { UId: senderUID } });
    const receiverExists = await User.findOne({ where: { UId: receiverUID } });

    if (senderExists && receiverExists) {
        const requestExists = await Request.findOne({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { sender_id: senderExists.id },
                            { receiver_id: receiverExists.id },
                        ]
                    },
                    {
                        [Op.and]: [
                            { sender_id: receiverExists.id },
                            { receiver_id: senderExists.id },
                        ]
                    }
                ]
            }
        });

      if (!requestExists) {
        const request = await Request.create({
          sender_id: senderExists.id,
          receiver_id: receiverExists.id,
        });


        return res
          .status(200)
          .json({
            status: true,
            message: "Request Sent Successfully",
            request,
          });
      } else {
        return res
          .status(500)
          .json({ status: false, message: "Request Already Sent" });
      }
    } else {
      return res
        .status(404)
        .json({
          status: false,
          message: "Users not Found",
          error: "Sender ID or Receiver ID does not Exist",
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Could not send Request",
        error: error.message,
      });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { userId } = req.query;

    const userExists = await User.findOne({ where: { UId: userId } });

    if (!userExists) {
      return res
        .status(404)
        .json({
          status: false,
          message: "User Not Found",
          error: error.message,
        });
    }

    const recRequests = await Request.findAll({
      where: { receiver_id: userExists.id, request_status: "pending" },
    });

    if (recRequests.length > 0)
      return res
        .status(200)
        .json({
          status: true,
          message: "Requests Fetched Successfully",
          recRequests,
        });
    else
      return res
        .status(200)
        .json({
          status: true,
          message: "No Requests Exist for this User",
          recRequests,
        });
  } catch (error) {
    res
      .status(500)
      .json({
        status: false,
        message: "Could not Fetch Requests",
        error: error.message,
      });
  }
};

exports.acceptRequest = async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        const userExists = await User.findOne({ where: { UId: userId } });
        const senderExists = await User.findOne({ where: { UId: senderId } });

        if(!userExists || !senderExists){
          return res
            .status(404)
            .json({
              status: false,
              message: "User Not Found",
            });
        }
        
        const reqExists = await Request.findOne({where: {sender_id: senderExists.id, receiver_id: userExists.id, request_status: 'pending'}});

        if(!reqExists)
        {
            return res
            .status(404)
            .json({
              status: false,
              message: "Request Not Found",
            });
        }

        const accept = await reqExists.update({request_status: 'accepted'});

        res.status(201).json({status: true, message: "Request Accepted Successfully", accept});
    } catch (error) {
        res.status(500).json({status: false, message: "Could Not Accept Request", error: error.message});
    }
};

exports.rejectRequest = async (req, res) => {
    try {
        const { userId, senderId } = req.body;

        const userExists = await User.findOne({ where: { UId: userId } });
        const senderExists = await User.findOne({ where: { UId: senderId } });

        if(!userExists || !senderExists){
          return res
            .status(404)
            .json({
              status: false,
              message: "User Not Found",
            });
        }
        
        const reqExists = await Request.findOne({where: {sender_id: senderExists.id, receiver_id: userExists.id, request_status: 'pending'}});

        if(!reqExists)
        {
            return res
            .status(404)
            .json({
              status: false,
              message: "Request Not Found",
            });
        }

        const reject = await reqExists.update({request_status: 'rejected'});

        res.status(201).json({status: true, message: "Request Rejected Successfully", reject});
    } catch (error) {
        res.status(500).json({status: false, message: "Could Not Reject Request", error: error.message});
    }
};
exports.getFriendList = async (req, res) => {
    try {
        const { userId } = req.query;

        const userExists = await User.findOne({ where: { UId: userId } });
        
        if (!userExists) {
            return res
                .status(404)
                .json({
                    status: false,
                    message: "User Not Found",
                });
        }
        
        const friendList = await Request.findAll({
            where: {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { sender_id: userExists.id },
                            { request_status: 'accepted' },
                        ]
                    },
                    {
                        [Op.and]: [
                            { receiver_id: userExists.id },
                            { request_status: 'accepted' },
                        ]
                    }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'Sender',
                    attributes: ['id', 'UId', 'name'] // Specify the attributes you want to include
                },
                {
                    model: User,
                    as: 'Receiver',
                    attributes: ['id', 'UId', 'name'] // Specify the attributes you want to include
                }
            ]
        });

        if (friendList.length == 0) {
            return res
                .status(404)
                .json({
                    status: false,
                    message: "No Friends to Show",
                });
        }

        // Filter out the user itself from the friend list
        const friends = friendList.map(request => {
            if (request.sender_id === userExists.id) {
                return request.Receiver;
            } else {
                return request.Sender;
            }
        });

        res.status(200).json({ status: true, message: "Friends Fetched Successfully", friends });
    } catch (error) {
        res.status(500).json({ status: false, message: "Could Not Fetch Friends", error: error.message });
    }
};