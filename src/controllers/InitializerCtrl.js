let padStr = (i) => {
    return (i < 10) ? "0" + i : "" + i;
};

const InitializerCtrl = {
    start: (app) => {
        app.locals.dateToDDMMYYYY = (dte) => {
            if (dte == null)
                return "-";
            return padStr(dte.getDate()) + '/' + padStr(1 + dte.getMonth()) + '/' + padStr(dte.getFullYear());
        };

        app.locals.dateToDDMMYYYY_HHMMSS = (dte) => {
            if (dte == null)
                return "-";
            return padStr(dte.getDate()) + '/' + padStr(1 + dte.getMonth()) + '/' + padStr(dte.getFullYear()) + ' ' + 
                padStr(dte.getHours()) + ':' + padStr(dte.getMinutes()) + ':' + padStr(dte.getSeconds());
        };

        app.locals.euroFormatter = (val) => {
            if (val == null)
                return '0 €';

            let suffix = '',
                str = '',
                j = 0;

            suffix = padStr(((val - parseInt(val))*100).toFixed(0));
            val = parseInt(val).toString();

            for (let i = val.length-1; i >= 0; i--) {
                str = val[i] + str;
                j++;
                if ((j % 3 == 0) && (i!=0)) {
                    str = '.' + str;
                }
            }
            return str + ',' + suffix + ' €';
        };
    },

    dateToDDMMYYYYHHMM: (dte) => {
        if (dte == null)
            return "-";
        return padStr(dte.getDate()) + padStr(1 + dte.getMonth()) + padStr(dte.getFullYear()) +
            padStr(dte.getHours()) + padStr(dte.getMinutes()) + padStr(dte.getSeconds()) + padStr(dte.getMilliseconds());
    }
};

export default InitializerCtrl;