define(function () {
    function BaseReference() {
    }

    BaseReference.prototype = {
        castValue: function (value, type) {
            if (typeof value !== "string") {
                return value.type.castTo(value.getValue(), type);
            } else {
                return type.cast(value);
            }
        }
    }

    return BaseReference;
});