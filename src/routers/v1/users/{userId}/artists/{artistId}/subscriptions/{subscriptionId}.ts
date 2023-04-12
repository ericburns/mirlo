import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import {
  userAuthenticated,
  userHasPermission,
} from "../../../../../../../auth/passport";
import { doesSubscriptionTierBelongToUser } from "../../../../../../../utils/ownership";

const prisma = new PrismaClient();

export default function () {
  const operations = {
    PUT: [userAuthenticated, userHasPermission("owner"), PUT],
    DELETE: [userAuthenticated, userHasPermission("owner"), DELETE],
  };

  async function PUT(req: Request, res: Response, next: NextFunction) {
    const { subscriptionId, userId } = req.params;

    try {
      const subscriptionTier = await doesSubscriptionTierBelongToUser(
        Number(subscriptionId),
        Number(userId)
      );

      if (!subscriptionTier) {
        res.status(400).json({
          error: "Subscription must belong to user",
        });
        return next();
      }

      const updatedTier = await prisma.artistSubscriptionTier.update({
        where: { id: Number(subscriptionId) },
        data: {
          name: req.body.name,
          description: req.body.description,
          // TODO: make sure minAmount is alphanumeric
          minAmount: req.body.minAmount.replace(",", ""),
        },
      });

      res.json({ result: updatedTier });
    } catch (error) {
      res.json({
        error: `Subscription with ID ${subscriptionId} does not exist in the database`,
      });
    }
  }

  PUT.apiDoc = {
    summary: "Updates a subscription belonging to a user",
    parameters: [
      {
        in: "path",
        name: "subscriptionId",
        required: true,
        type: "string",
      },
      {
        in: "path",
        name: "userId",
        required: true,
        type: "string",
      },
      {
        in: "path",
        name: "artistId",
        required: true,
        type: "string",
      },
      {
        in: "body",
        name: "subscription",
        schema: {
          $ref: "#/definitions/ArtistSubscriptionTier",
        },
      },
    ],
    responses: {
      200: {
        description: "Updated subscription",
        schema: {
          $ref: "#/definitions/ArtistSubscriptionTier",
        },
      },
      default: {
        description: "An error occurred",
        schema: {
          additionalProperties: true,
        },
      },
    },
  };

  async function DELETE(req: Request, res: Response, next: NextFunction) {
    const { userId, subscriptionId } = req.params;

    const track = await doesSubscriptionTierBelongToUser(
      Number(subscriptionId),
      Number(userId)
    );

    if (!track) {
      res.status(400).json({
        error: "ArtistSubscriptionTier must belong to user",
      });
      return next();
    }
    await prisma.artistSubscriptionTier.delete({
      where: {
        id: Number(subscriptionId),
      },
    });
    res.json({ message: "Success" });
  }

  DELETE.apiDoc = {
    summary: "Deletes a ArtistSubscriptionTier",
    parameters: [
      {
        in: "path",
        name: "subscriptionId",
        required: true,
        type: "string",
      },
      {
        in: "path",
        name: "artistId",
        required: true,
        type: "string",
      },
      {
        in: "path",
        name: "userId",
        required: true,
        type: "string",
      },
    ],
    responses: {
      200: {
        description: "Delete success",
      },
      default: {
        description: "An error occurred",
        schema: {
          additionalProperties: true,
        },
      },
    },
  };

  return operations;
}