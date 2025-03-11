import { assert, assertEquals, assertRejects } from "https://deno.land/std@0.106.0/testing/asserts.ts";
import sinon from "sinon";
import User, { Status } from "../model/User.ts";
import { UserService } from "../services/user.service.ts";
import { HttpError } from "../utils/HttpError.ts";
import { ImageService } from "../utils/ImageUtils.ts";

Deno.test("UserService.getByUsername", async (t) => {
    let findOneStub: sinon.SinonStub;
    const userId = "123";
    const anotherUserId = "99999";

    await t.step("returns user if found", async () => {
        const testUser = { id: userId, username: "testuser", status: Status.Visible };

        findOneStub = sinon.stub(User, "findOne").resolves(testUser);

        try {
            const user = await UserService.getByUsername("testuser", userId);
            assertEquals(user.username, "testuser");
        } finally {
            findOneStub.restore();
        }
    });

    await t.step("returns user if unverified but myself", async () => {
        const testUser = { id: userId, username: "testuser", status: Status.Unverified };
        findOneStub = sinon.stub(User, "findOne").resolves(testUser);

        try {
            const user = await UserService.getByUsername("testuser", userId);
            assertEquals(user.username, "testuser");
        } finally {
            findOneStub.restore();
        }
    });


    await t.step("throws 400 if user not verified and not me", async () => {
        const testUser = { id: userId, username: "testuser", status: Status.Unverified };

        findOneStub = sinon.stub(User, "findOne").resolves(testUser);

        try {
            await assertRejects(
                async () => await UserService.getByUsername("testuser", anotherUserId),
                HttpError,
                "This Profile is not verified yet"
            );
        } finally {
            findOneStub.restore();
        }
    });

   await  t.step("returns user if disabled but myself", async () => {
        const testUser = { id: userId, username: "testuser", status: Status.Disabled };

        findOneStub = sinon.stub(User, "findOne").resolves(testUser);

        try {
            const user = await UserService.getByUsername("testuser", userId);
            assertEquals(user.username, "testuser");
        } finally {
            findOneStub.restore();
        }
    });

    await t.step("throws 400 if user not disabled and not me", async () => {
        const testUser = { id: userId, username: "testuser", status: Status.Disabled };

        findOneStub = sinon.stub(User, "findOne").resolves(testUser);

        try {
            await assertRejects(
                async () => await UserService.getByUsername("testuser", anotherUserId),
                HttpError,
                "disabled"
            );
        } finally {
            findOneStub.restore();
        }
    });

    await t.step("throws 404 if user not found", async () => {
        findOneStub = sinon.stub(User, "findOne").resolves(null);

        try {
            await assertRejects(
                () => UserService.getByUsername("testuser", userId),
                HttpError,
                "Profile not found"
            );
        } finally {
            findOneStub.restore();
        }
    });
});

Deno.test("UserService.updateUsername", async (t) => {
    //find user with username
    let findStub: sinon.SinonStub;
    let findOneAndUpdateStub: sinon.SinonStub;

    await t.step("should update username if not taken", async () => {
        const testUser = { id: "1", username: "oldusername", status: "Visible" };
        
        findStub = sinon.stub(User, "find").resolves([]);
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves({ ...testUser, username: "newusername" });

        const updatedUser = await UserService.updateUsername("1", "newusername");

        assertEquals(updatedUser.username, "newusername");

        findStub.restore();
        findOneAndUpdateStub.restore();
    });

    await t.step("should throw 400 if username is already taken", async () => {
        const otherUser = { id: "2", username: "newusername", status: Status.Visible };
        const testUser = { id: "1", username: "oldusername", status: Status.Visible };
        
        findStub = sinon.stub(User, "find").resolves([otherUser]);
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves({ ...testUser, username: "newusername" });

        await assertRejects(
            () => UserService.updateUsername("1", "newusername"),
            HttpError,
            "Username already exists"
        );

        findStub.restore();
        findOneAndUpdateStub.restore();
    });

    await t.step("should throw 404 if wrong userId", async () => {        
        findStub = sinon.stub(User, "find").resolves([]);
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves(null);

        await assertRejects(
            () => UserService.updateUsername("999", "newusername"),
            HttpError,
            "not found"
        );

        findStub.restore();
        findOneAndUpdateStub.restore();
    });
});

Deno.test("UserService.updateDescription", async (t) => {
    // find user with description
    let findStub: sinon.SinonStub;
    let findOneAndUpdateStub: sinon.SinonStub;

    await t.step("should update description if not taken", async () => {
        const testUser = { id: "1", username: "testuser", description: "Old description"};

        findStub = sinon.stub(User, "find").resolves([]);
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves({ ...testUser, description: "New description" });

        const updatedUser = await UserService.updateDescription("1", "New description");

        assertEquals(updatedUser.description, "New description");

        findStub.restore();
        findOneAndUpdateStub.restore();
    });


    await t.step("should throw 404 if wrong userId", async () => {
        findStub = sinon.stub(User, "find").resolves([]);
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves(null);

        await assertRejects(
            () => UserService.updateDescription("999", "New description"),
            HttpError,
            "Profile not found"
        );

        findStub.restore();
        findOneAndUpdateStub.restore();
    });
});

Deno.test("UserService.updateDisplayName", async (t) => {
    let findOneAndUpdateStub: sinon.SinonStub;

    await t.step("should update display name", async () => {
        const testUser = { id: "1", username: "testuser", displayName: "Old DisplayName"};

        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves({ ...testUser, displayName: "New DisplayName" });

        const updatedUser = await UserService.updateDisplayName("1", "New DisplayName");

        assertEquals(updatedUser.displayName, "New DisplayName");

        findOneAndUpdateStub.restore();
    });

    await t.step("should throw 404 if wrong userId", async () => {
        findOneAndUpdateStub = sinon.stub(User, "findOneAndUpdate").resolves(null);

        await assertRejects(
            () => UserService.updateDisplayName("999", "New DisplayName"),
            HttpError,
            "Profile not found"
        );

        findOneAndUpdateStub.restore();
    });
});


Deno.test("UserService.updateStatus", async (t) => {
    let findByIdStub: sinon.SinonStub;

    await t.step("should update status if valid", async () => {
        const testUser = { id: "1", username: "testuser", status: Status.Visible, save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);

        const updatedUser = await UserService.updateStatus("1", Status.Disabled);

        assertEquals(updatedUser.status, Status.Disabled);

        findByIdStub.restore();
    });

    await t.step("should throw 400 if invalid status", async () => {
        await assertRejects(
            () => UserService.updateStatus("1", "invalid_status" as Status),
            HttpError,
            "Invalid status type"
        );
    });

    await t.step("should throw 404 if profile not found", async () => {
        findByIdStub = sinon.stub(User, "findById").resolves(null);

        await assertRejects(
            () => UserService.updateStatus("999", Status.Visible),
            HttpError,
            "Profile not found"
        );

        // Cleanup
        findByIdStub.restore();
    });

    await t.step("should throw 401 if profile is unverified", async () => {
        const testUser = { id: "1", username: "testuser", status: Status.Unverified };

        // Mock: User is unverified
        findByIdStub = sinon.stub(User, "findById").resolves(testUser);

        // Act & Assert: Should throw 401 error for unverified profile
        await assertRejects(
            () => UserService.updateStatus("1", Status.Visible),
            HttpError,
            "Your Profile has to be verified to change your status"
        );

        // Cleanup
        findByIdStub.restore();
    });
});

Deno.test("UserService.uploadAvatar", async (t) => {
    let findByIdStub: sinon.SinonStub;
    let saveImageFileStub: sinon.SinonStub;
    let deleteImageStub: sinon.SinonStub;

    await t.step("should upload avatar successfully", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        saveImageFileStub = sinon.stub(ImageService, "saveImageFile").resolves("path/to/new-avatar.jpg");
        deleteImageStub = sinon.stub(ImageService, "deleteImage").resolves(undefined);

        const avatar = new File([], "avatar.jpg"); // This should be a mock or stub, depending on your environment
        const originUrl = "http://example.com/";

        const updatedUser = await UserService.uploadAvatar(avatar, "1", originUrl);

        assertEquals(updatedUser.avatarUrl, "http://example.com/path/to/new-avatar.jpg");
        assert(saveImageFileStub.calledOnce);
        assert(deleteImageStub.notCalled);

        findByIdStub.restore();
        saveImageFileStub.restore();
        deleteImageStub.restore();
    });

    await t.step("should throw 404 if user is not found", async () => {
        findByIdStub = sinon.stub(User, "findById").resolves(null);

        const avatar = new File([], "avatar.jpg");
        const originUrl = "http://example.com/";

        await assertRejects(
            () => UserService.uploadAvatar(avatar, "999", originUrl),
            HttpError,
            "Profile not found"
        );

        findByIdStub.restore();
    });

    await t.step("should throw 500 if unable to save avatar", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        saveImageFileStub = sinon.stub(ImageService, "saveImageFile").rejects(new Error("Failed to save image"));

        const avatar = new File([], "avatar.jpg");
        const originUrl = "http://example.com/";

        await assertRejects(
            () => UserService.uploadAvatar(avatar, "1", originUrl),
            HttpError,
            "Unable to save new avatar"
        );

        findByIdStub.restore();
        saveImageFileStub.restore();
    });

    await t.step("should attempt to delete old avatar if present", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "http://example.com/oldavatar.jpg", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        saveImageFileStub = sinon.stub(ImageService, "saveImageFile").resolves("path/to/avatar.jpg");
        deleteImageStub = sinon.stub(ImageService, "deleteImage").resolves(undefined);

        const avatar = new File([], "avatar.jpg");
        const originUrl = "http://example.com/";

        const updatedUser = await UserService.uploadAvatar(avatar, "1", originUrl);

        assertEquals(updatedUser.avatarUrl, "http://example.com/path/to/avatar.jpg");
        assert(deleteImageStub.calledOnce);
        assert(saveImageFileStub.calledOnce);

        findByIdStub.restore();
        saveImageFileStub.restore();
        deleteImageStub.restore();
    });

    await t.step("should log and not throw error if deleting old avatar fails", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "http://example.com/oldavatar.jpg", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        saveImageFileStub = sinon.stub(ImageService, "saveImageFile").resolves("path/to/avatar.jpg");
        deleteImageStub = sinon.stub(ImageService, "deleteImage").rejects(new Error("Failed to delete image"));

        const avatar = new File([], "avatar.jpg");
        const originUrl = "http://example.com/";

        const updatedUser = await UserService.uploadAvatar(avatar, "1", originUrl);

        assertEquals(updatedUser.avatarUrl, "http://example.com/path/to/avatar.jpg");
        assert(deleteImageStub.calledOnce);
        assert(saveImageFileStub.calledOnce);

        findByIdStub.restore();
        saveImageFileStub.restore();
        deleteImageStub.restore();
    });
});
Deno.test("UserService.deleteAvatar", async (t) => {
    let findByIdStub: sinon.SinonStub;
    let deleteImageStub: sinon.SinonStub;

    await t.step("should throw 404 if user is not found", async () => {
        findByIdStub = sinon.stub(User, "findById").resolves(null);

        await assertRejects(
            () => UserService.deleteAvatar("999"),
            HttpError,
            "Profile not found"
        );

        findByIdStub.restore();
    });

    await t.step("should not delete avatar if there is no avatar URL", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        deleteImageStub = sinon.stub(ImageService, "deleteImage");

        const result = await UserService.deleteAvatar("1");

        assertEquals(result.avatarUrl, undefined);
        assert(deleteImageStub.notCalled);

        findByIdStub.restore();
        deleteImageStub.restore();
    });

    await t.step("should delete avatar if there is an avatar URL", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "http://example.com/oldavatar.jpg", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        deleteImageStub = sinon.stub(ImageService, "deleteImage").resolves(undefined);

        const result = await UserService.deleteAvatar("1");

        assertEquals(result.avatarUrl, undefined);
        assert(deleteImageStub.calledOnce);

        findByIdStub.restore();
        deleteImageStub.restore();
    });

    await t.step("should log and not throw error if deleting avatar fails", async () => {
        const testUser = { id: "1", username: "testuser", avatarUrl: "http://example.com/oldavatar.jpg", save: sinon.stub().resolvesThis() };

        findByIdStub = sinon.stub(User, "findById").resolves(testUser);
        deleteImageStub = sinon.stub(ImageService, "deleteImage").rejects(new Error("Failed to delete image"));

        const result = await UserService.deleteAvatar("1");

        assertEquals(result.avatarUrl, undefined);
        assert(deleteImageStub.calledOnce);

        findByIdStub.restore();
        deleteImageStub.restore();
    });
});
