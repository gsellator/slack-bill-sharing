var padStr = function(i) {
    return (i < 10) ? "0" + i : "" + i;
};

module.exports = {
    start: function(app){
        app.locals.dateToDDMMYYYY = function(dte) {
            if (dte == null)
                return "-";
            return padStr(dte.getDate()) + '/' + padStr(1 + dte.getMonth()) + '/' + padStr(dte.getFullYear());
        };

        app.locals.dateToDDMMYYYY_HHMMSS = function(dte) {
            if (dte == null)
                return "-";
            return padStr(dte.getDate()) + '/' + padStr(1 + dte.getMonth()) + '/' + padStr(dte.getFullYear()) + ' ' + 
                padStr(dte.getHours()) + ':' + padStr(dte.getMinutes()) + ':' + padStr(dte.getSeconds());
        };

        app.locals.euroFormatter = function(val) {
            if (val == null)
                return '0 €';

            var suffix = '',
                str = '',
                j = 0;

            suffix = padStr(((val - parseInt(val))*100).toFixed(0));
            val = parseInt(val).toString();

            for (var i = val.length-1; i >= 0; i--) {
                str = val[i] + str;
                j++;
                if ((j % 3 == 0) && (i!=0)) {
                    str = '.' + str;
                }
            }
            return str + ',' + suffix + ' €';
        };
    },

    dateToDDMMYYYYHHMM: function(dte) {
        if (dte == null)
            return "-";
        return padStr(dte.getDate()) + padStr(1 + dte.getMonth()) + padStr(dte.getFullYear()) +
            padStr(dte.getHours()) + padStr(dte.getMinutes()) + padStr(dte.getSeconds()) + padStr(dte.getMilliseconds());
    }
};