import React from 'react';
import { Star, ThumbsUp, Flag, Edit2, Trash2, AlertTriangle } from 'lucide-react';

function StarRating({ rating, onRatingChange, editable = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => editable && onRatingChange && onRatingChange(star)}
          disabled={!editable}
          className={`transition-transform ${
            editable ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-black text-black'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ 
  review, 
  currentUserId, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onFlag, 
  onApprove, 
  onMarkHelpful 
}) {
  const canEdit = currentUserId === review.userId;
  const canDelete = canEdit || isAdmin;
  const showModeration = isAdmin;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div 
      className={`bg-white border p-6 transition-all duration-300 hover:border-black ${
        review.flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-lg">
            {review.userFirstName?.charAt(0)}{review.userLastName?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-black">
              {review.userFirstName} {review.userLastName}
            </h4>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.flagged && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              Flagged
            </span>
          )}
          {!review.approved && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium">
              Pending
            </span>
          )}
          <StarRating rating={review.rating} />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-500 mb-1">
          {review.productName}
        </p>
        <p className="text-gray-800 leading-relaxed">{review.comment}</p>
      </div>

      {review.flagReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
          <strong>Flag Reason:</strong> {review.flagReason}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onMarkHelpful && onMarkHelpful(review.id)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Helpful ({review.helpfulCount || 0})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showModeration && !review.approved && (
            <button
              onClick={() => onApprove && onApprove(review.id)}
              className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Approve
            </button>
          )}
          
          {showModeration && !review.flagged && (
            <button
              onClick={() => {
                const reason = prompt('Enter flag reason:');
                if (reason) onFlag && onFlag(review.id, reason);
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Flag review"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => onEdit && onEdit(review)}
              className="p-2 text-gray-400 hover:text-black transition-colors"
              title="Edit review"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this review?')) {
                  onDelete && onDelete(review.id);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete review"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
