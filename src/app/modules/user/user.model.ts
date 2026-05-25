import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema, SchemaType, Types } from 'mongoose';
import config from '../../../config';
import { ORGANIZATION_TYPE, USECASE_PLATFORM, USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { FaceVerificationModal, FollowerModal, IFaceVerification, IFollower, IOrganization, IUser, OrganizationModal, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
      minlength: 8,
    },
    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    contact: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null
    }
  },
  { timestamps: true,discriminatorKey: 'role' }
);

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user
  const isExist = await User.findOne({ email: this.email });
  if (isExist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exist!');
  }

  //password hash
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);


const organizationSchema = new Schema<IOrganization, OrganizationModal>({
  organization_name: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  contact_name: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  organization_type: {
    type: String,
    enum: Object.values(ORGANIZATION_TYPE),
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  use_case: {
    type: String,
    enum: Object.values(USECASE_PLATFORM),
    required: true,
  },

})

export const Organization = User.discriminator<IOrganization, OrganizationModal>('ORGANIZATION', organizationSchema);
export const NormalUser = User.discriminator<IUser, UserModal>(USER_ROLES.USER, new Schema({}));
export const Admin = User.discriminator<IUser, UserModal>('ADMIN', new Schema({}));
export const SuperAdmin = User.discriminator<IUser, UserModal>('SUPER_ADMIN', new Schema({}));

const faceVerificationSchema = new Schema<IFaceVerification, FaceVerificationModal>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  faceDescriptor: {
    type: Schema.Types.Mixed,
    required: true,
  },
  device_id: {
    type: String,
    required: true,
  },
})

faceVerificationSchema.index({ userId: 1 });
faceVerificationSchema.index({ device_id: 1 });

export const FaceVerification = model<IFaceVerification, FaceVerificationModal>('FaceVerification', faceVerificationSchema);


const followSchema = new Schema<IFollower, FollowerModal>({
  follower: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  following: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  
},{
  timestamps: true,
})

followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.statics.followUser = async (follower: Types.ObjectId, following: Types.ObjectId): Promise<IFollower> => {
  const exist = await Follower.findOne({ follower, following });
  if (exist) {
    await exist.deleteOne();
    await User.findByIdAndUpdate(follower, { $inc: { followers_count: -1 } });
    return exist
  }

  
  await User.findByIdAndUpdate(follower, { $inc: { followers_count: 1 } });
  return await Follower.create({ follower, following });
}

export const Follower = model<IFollower, FollowerModal>('Follower', followSchema);