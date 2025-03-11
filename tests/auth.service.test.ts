import sinon from "sinon";
import User, { Status } from "../model/User.ts";
import { AuthService } from "../services/auth.service.ts";
import {
  assertEquals,
  assertNotEquals,
  assertRejects,
  assertStrictEquals,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";
import { JwtUtils } from "../utils/jwt.ts";
import { EmailUtils } from "../utils/sendEmail.ts";
import { HttpError } from "../utils/HttpError.ts";
import * as bcrypt from "bcrypt";
import { assert } from "@std/assert/assert";

Deno.test("AuthService.register", async (t) => {
  let findOneStub: sinon.SinonStub;
  let create: sinon.SinonStub;
  let createJWT: sinon.SinonStub;
  let sendVerificationEmail: sinon.SinonStub;

  await t.step("returns jwt if successfull", async () => {
    const jwt = "jwt";

    findOneStub = sinon.stub(User, "findOne").resolves();
    create = sinon.stub(User, "create").resolves({ _id: "1" });
    createJWT = sinon.stub(JwtUtils, "createJWT").resolves(jwt);
    sendVerificationEmail = sinon.stub(EmailUtils, "sendVerificationEmail")
      .resolves();

    try {
      const returnedJwt = await AuthService.register(
        "test.test@gmail.com",
        "test",
        "password",
      );
      assertEquals(returnedJwt, jwt);
      const call = create.getCall(0);
      const [userData] = call.args;
      assertEquals(userData.email, "test.test@gmail.com");
      assertEquals(userData.username, "test");
      assertNotEquals(userData.password, "password");
      assertEquals(userData.status, Status.Unverified);
      assert(sendVerificationEmail.calledOnce);
      assert(createJWT.calledOnce);
    } finally {
      findOneStub.restore();
      create.restore();
      createJWT.restore();
      sendVerificationEmail.restore();
    }
  });

  await t.step("throws 400 error, username already exsits", async () => {
    findOneStub = sinon.stub(User, "findOne").resolves({ _id: "1" });

    try {
      await assertRejects(
        async () =>
          await AuthService.register("test.test@gmail.com", "test", "password"),
        HttpError,
        "already exists",
      );
    } finally {
      findOneStub.restore();
    }
  });

  await t.step("not allowed Username, throws error", async () => {
    const invalidUsernames = [
      "explore",
      "auth",
      "dashboard",
      "verify",
      "password",
      "credits",
      "imprint",
      "privacy",
      "test/test",
      "maxLenghtmaxLenghtmaxLenghtmaxLenght",
      "aa",
    ];

    for (const username of invalidUsernames) {
      try {
        await assertRejects(
          async () =>
            await AuthService.register(
              "test.test@gmail.com",
              username,
              "password",
            ),
          HttpError,
        );
      } finally {
        findOneStub.restore();
      }
    }
  });
});

Deno.test("AuthService.login", async (t) => {
  let findOneStub: sinon.SinonStub;
  let createJWT: sinon.SinonStub;

  await t.step("returns jwt if successful", async () => {
    const jwt = "jwt";
    const password = await bcrypt.hash("password");
    const user = {
      _id: "1",
      username: "test",
      password: password,
    };

    findOneStub = sinon.stub(User, "findOne").resolves(user);
    createJWT = sinon.stub(JwtUtils, "createJWT").resolves(jwt);

    try {
      const returnedJwt = await AuthService.login(
        "test.test@gmail.com",
        "password",
      );
      assertEquals(returnedJwt, jwt);
      assert(createJWT.calledOnce);
    } finally {
      findOneStub.restore();
      createJWT.restore();
    }
  });

  await t.step("wrong email, return invidial credentials", async () => {
    findOneStub = sinon.stub(User, "findOne").resolves(null);
    try {
      await assertRejects(
        async () => await AuthService.login("test.test@gmail.com", "password"),
        HttpError,
        "Invalid credentials",
      );
    } finally {
      findOneStub.restore();
    }
  });

  await t.step("wrong password, return invidial credentials", async () => {
    const jwt = "jwt";
    const password = await bcrypt.hash("password");
    const user = {
      _id: "1",
      username: "test",
      password: password,
    };

    findOneStub = sinon.stub(User, "findOne").resolves(user);
    createJWT = sinon.stub(JwtUtils, "createJWT").resolves(jwt);

    try {
      await assertRejects(
        async () =>
          await AuthService.login("test.test@gmail.com", "wrongPassword"),
        HttpError,
        "Invalid credentials",
      );
    } finally {
      findOneStub.restore();
      createJWT.restore();
    }
  });
});

Deno.test("AuthService.verify", async (t) => {
  let findAndUpdate: sinon.SinonStub;

  await t.step("successfully find and update", async () => {
    const user = {
      _id: "1",
      username: "test",
      status: Status.Visible,
    };
    findAndUpdate = sinon.stub(User, "findOneAndUpdate").resolves(user);
    try {
      await AuthService.verify("code");
      assert(findAndUpdate.calledOnce);
    } finally {
      findAndUpdate.restore();
    }
  });

  await t.step("wrong code, throw error", async () => {
    findAndUpdate = sinon.stub(User, "findOneAndUpdate").resolves(null);
    try {
      await assertRejects(
        async () => await AuthService.verify("wrongCode"),
        HttpError,
        "Invalid Verification Code",
      );
    } finally {
      findAndUpdate.restore();
    }
  });
});

Deno.test("AuthService.requestPasswordReset", async (t) => {
  let findOne: sinon.SinonStub;
  let sendEmail: sinon.SinonStub;

  await t.step(
    "successfully set password reset token and send mail",
    async () => {
      // deno-lint-ignore no-explicit-any
      const testUser: any = {
        _id: "1",
        username: "testuser",
        save: sinon.stub().resolvesThis(),
        passwordResetToken: undefined,
        passwordResetExpiresTimestamp: undefined,
      };
      findOne = sinon.stub(User, "findOne").resolves(testUser);
      sendEmail = sinon.stub(EmailUtils, "sendPasswordResetEmail").resolves();

      try {
        await AuthService.requestPasswordReset("test@example.com");

        assert(testUser.passwordResetToken != undefined);
        assert(testUser.passwordResetExpiresTimestamp instanceof Date);
        assert(testUser.passwordResetExpiresTimestamp > new Date());
        assert(sendEmail.calledOnce);
        assert(sendEmail.calledWithMatch(
          "test@example.com",
          sinon.match.string,
          "30 min",
        ));
      } finally {
        findOne.restore();
        sendEmail.restore();
      }
    },
  );

  await t.step("no user found, throw 404 user not found error", async () => {
    findOne = sinon.stub(User, "findOne").resolves(null);

    try {
      await assertRejects(
        async () =>
          await AuthService.requestPasswordReset("wrongEmail@gmail.com"),
        HttpError,
        "User with that email does not exist",
      );
    } finally {
      findOne.restore();
      sendEmail.restore();
    }
  });

  await t.step("fail to send email, throw error", async () => {
    const testUser = {
      _id: "1",
      username: "testuser",
    };

    findOne = sinon.stub(User, "findOne").resolves(testUser);
    sendEmail = sinon.stub(EmailUtils, "sendPasswordResetEmail").rejects();

    try {
      await assertRejects(
        async () =>
          await AuthService.requestPasswordReset("wrongEmail@gmail.com"),
        HttpError,
        "failed to send email",
      );
    } finally {
      findOne.restore();
      sendEmail.restore();
    }
  });
});

Deno.test("AuthService.resetPassword", async (t) => {
  let findOne: sinon.SinonStub;
  await t.step("successfully resets password when token is valid", async () => {
    const token = "valid-token";
    const encodedToken = new TextEncoder().encode(token);
    const hashedTokenBuffer = await crypto.subtle.digest(
      "SHA-256",
      encodedToken,
    );
    const hashedToken = new TextDecoder().decode(hashedTokenBuffer);

    const testUser = {
      id: "1",
      password: "oldPassword",
      passwordResetToken: hashedToken,
      passwordResetExpiresTimestamp: new Date(Date.now() + 30 * 60 * 1000),
      save: sinon.stub().resolvesThis(),
    };

    const newPassword = "newSecurePassword";

    findOne = sinon.stub(User, "findOne").resolves(testUser);

    try {
      await AuthService.resetPassword(token, newPassword);

      assert(!testUser.passwordResetToken);
      assert(!testUser.passwordResetExpiresTimestamp);
      assert(bcrypt.compare(newPassword, testUser.password));
    } finally {
      findOne.restore();
    }
  });

  await t.step("throws error if reset token is invalid", async () => {
    const findOneStub = sinon.stub(User, "findOne").resolves(null);

    try {
      await assertRejects(
        async () => {
          await AuthService.resetPassword("invalid-token", "newPassword");
        },
        HttpError,
        "User with reset Token not found",
      );
    } finally {
      findOneStub.restore();
    }
  });

  await t.step("throws error if reset token has expired", async () => {
    const testUser = {
      id: "1",
      passwordResetToken: "token",
      passwordResetExpiresTimestamp: new Date(Date.now() - 10 * 60 * 1000), // Expired timestamp
    };

    const findOneStub = sinon.stub(User, "findOne").resolves(testUser);

    try {
      await assertRejects(
        async () => {
          await AuthService.resetPassword("token", "newPassword");
        },
        HttpError,
        "Password reset token expired",
      );
    } finally {
      findOneStub.restore();
    }
  });

  await t.step("throws error if expiration timestamp is missing", async () => {
    const testUser = {
      id: "1222",
      passwordResetToken: "token",
      passwordResetExpiresTimestamp: undefined, // Missing timestamp
      save: sinon.stub().resolvesThis(),
    };

    const findOneStub = sinon.stub(User, "findOne").resolves(testUser);

    try {
      await assertRejects(
        async () => {
          await AuthService.resetPassword("token", "newPassword");
        },
        HttpError,
        "Invalid expiration time",
      );
    } finally {
      findOneStub.restore();
    }
  });
});

Deno.test("UserService.resendVerificationCode", async (t) => {
  let findById: sinon.SinonStub;

  await t.step("should throw 404 if user is not found", async () => {
    findById = sinon.stub(User, "findById").resolves(null);

    try {
      await assertRejects(
        () => AuthService.resendVerificationCode("invalidUserId"),
        HttpError,
        "User not found",
      );
    } finally {
      findById.restore();
    }
  });

  await t.step("should throw 400 if user is already verified", async () => {
    const testUser = { id: "1", status: Status.Visible };
    findById = sinon.stub(User, "findById").resolves(testUser);

    try {
      await assertRejects(
        () => AuthService.resendVerificationCode(testUser.id),
        HttpError,
        "Already verified",
      );
    } finally {
      findById.restore();
    }
  });

  await t.step(
    "should send a new verification code and save user",
    async () => {
      const testUser = {
        id: "1",
        email: "test@example.com",
        status: Status.Unverified,
        verificationCode: "",
        save: sinon.stub().resolvesThis(),
      };

      const findByIdStub = sinon.stub(User, "findById").resolves(testUser);
      const sendEmailStub = sinon.stub(EmailUtils, "sendVerificationEmail")
        .resolves();

      try {
        await AuthService.resendVerificationCode(testUser.id);

        assertStrictEquals(typeof testUser.verificationCode, "string");
        assertStrictEquals(testUser.verificationCode.length > 0, true);

        sinon.assert.calledOnce(testUser.save);
        sinon.assert.calledOnceWithExactly(
          sendEmailStub,
          testUser.email,
          testUser.verificationCode,
        );
      } finally {
        findByIdStub.restore();
        sendEmailStub.restore();
      }
    },
  );

  await t.step("should throw 500 if email sending fails", async () => {
    const testUser = {
      id: "1",
      email: "test@example.com",
      status: Status.Unverified,
      verificationCode: "",
      save: sinon.stub().resolvesThis(),
    };

    const findByIdStub = sinon.stub(User, "findById").resolves(testUser);
    const sendEmailStub = sinon
      .stub(EmailUtils, "sendVerificationEmail")
      .rejects(new Error("Email failed"));

    await assertRejects(
      () => AuthService.resendVerificationCode(testUser.id),
      HttpError,
      "An error occured sending the email.",
    );

    findByIdStub.restore();
    sendEmailStub.restore();
  });
});
