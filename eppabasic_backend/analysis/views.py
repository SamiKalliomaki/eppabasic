from django.http import HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.db.models import Count
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from matplotlib.figure import Figure
from matplotlib.dates import DateFormatter
from datetime import datetime, timedelta
from analysis.models import Entry as AnalysisEntry

class GraphView(View):

    @method_decorator(staff_member_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get(self, request):
        def getData(format):
            data = AnalysisEntry.objects.extra({'time2': 'strftime("' + format + '",time)'}).values('time2').order_by().annotate(count=Count('id'))
            times = []
            counts = []
            for entry in data:
                time = datetime.strptime(entry['time2'],'%Y-%m-%d:%H:%M:%S')
                count = int(entry['count'])
                times.append(time)
                counts.append(count)
            return (times, counts)
        
        now = datetime.utcnow()
        def plotData(plot, data, hours, width, format):
            plot.bar(data[0], data[1], width = width, align='center')
            plot.xaxis_date()
            plot.xaxis.set_major_formatter(DateFormatter(format))
            plot.set_xlim([now - timedelta(hours=hours), now])

        # Create plots
        figure = Figure(figsize=(20, 20))
        
        # Minutly plot
        plotMinute = figure.add_subplot(221)
        plotMinute.set_title('Last hour')
        plotData(plotMinute, getData('%Y-%m-%d:%H:%M:00'), 1, 1 / 24 / 60, '%H:%M')
        
        # Hourly plot
        plotHour = figure.add_subplot(222)
        plotHour.set_title('Last week')
        plotData(plotHour, getData('%Y-%m-%d:%H:00:00'), 24 * 7, 1 / 24, '%m-%d %H')
        
        # Daily plot
        plotDaily = figure.add_subplot(223)
        plotDaily.set_title('Last month')
        plotData(plotDaily, getData('%Y-%m-%d:00:00:00'), 24 * 30, 1, '%m-%d')
        
        # Monthly plot
        plotMonthly = figure.add_subplot(224)
        plotMonthly.set_title('Last year')
        plotData(plotMonthly, getData('%Y-%m-01:00:00:00'), 24 * 365, 30, '%Y-%m')
        
        canvas = FigureCanvas(figure)
        response = HttpResponse(content_type='image/png')
        canvas.print_png(response)
        return response

