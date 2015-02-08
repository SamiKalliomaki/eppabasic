from django.http import HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.db.models import Count
from datetime import datetime, timedelta
from analysis.models import Entry as AnalysisEntry

class GraphView(View):

    @method_decorator(staff_member_required)
    def dispatch(self, request, *args, **kwargs):
        return super(GraphView, self).dispatch(request, *args, **kwargs)

    def get(self, request):
        from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
        from matplotlib.figure import Figure
        from matplotlib.dates import DateFormatter
        
        # Gets data and filters it with format
        def getData(format):
            # Get all data
            data = AnalysisEntry.objects.all()
            
            # Filter it
            timecounts = dict()
            for entry in data:
                # This packs multiple timestamps into one
                timestamp = datetime.strptime(entry.time.strftime(format),'%Y-%m-%d:%H:%M:%S')
                # Count them
                if timestamp not in timecounts:
                    timecounts[timestamp] = 0
                timecounts[timestamp] += 1
            
            # Create two lists for matplotlib
            times = []
            counts = []
            for time, count in timecounts.items():
                times.append(time)
                counts.append(count)
            return (times, counts)
        
        now = datetime.utcnow()
        
        # Plots data returned by getData
        def plotData(plot, data, hours, width, format):
            # A bar plot
            plot.bar(data[0], data[1], width = width, align='center')
            # Axis names
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
        
        # Fill http response
        canvas = FigureCanvas(figure)
        response = HttpResponse(content_type='image/png')
        canvas.print_png(response)
        return response

