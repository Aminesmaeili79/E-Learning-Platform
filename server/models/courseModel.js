const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
        type: String,
        required: [true, 'Course author is required'],
        trim: true,
        maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    free: {
        type: Boolean,
        required: [true, 'Free status is required'],
        default: false
    },
    overview: {
        type: String,
        required: [true, 'Course overview is required'],
        trim: true,
        minlength: [50, 'Overview must be at least 50 characters'],
        maxlength: [2000, 'Overview cannot exceed 2000 characters']
    },
    img: {
        type: String,
        required: [true, 'Course image URL is required'],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(v) ||
                    /^https?:\/\/.+\/image\/\d+$/i.test(v); // For educative.io format
            },
            message: 'Please provide a valid image URL'
        }
    },
    url: {
        type: String,
        required: [true, 'Course URL is required'],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+$/i.test(v);
            },
            message: 'Please provide a valid URL'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

courseSchema.index({ title: 1 });
courseSchema.index({ author: 1 });
courseSchema.index({ free: 1 });
courseSchema.index({ title: 'text', overview: 'text' });

courseSchema.virtual('status').get(function () {
    return this.free ? 'Free' : 'Paid';
});

courseSchema.statics.findFreeCourses = function () {
    return this.find({ free: true });
};

courseSchema.statics.findPaidCourses = function () {
    return this.find({ free: false });
};

courseSchema.methods.getShortOverview = function (length = 150) {
    return this.overview.length > length
        ? this.overview.substring(0, length) + '...'
        : this.overview;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;