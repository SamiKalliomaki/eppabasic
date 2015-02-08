from django.http import HttpResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import View
from django.db.models import Count
from datetime import datetime, timedelta
from analysis.models import Entry as AnalysisEntry

class GraphView(View):
    @staticmethod
    def get_current_minute():
        pass

    @method_decorator(staff_member_required)
    def dispatch(self, request, *args, **kwargs):
        return super(GraphView, self).dispatch(request, *args, **kwargs)

    def get(self, request):
        from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
        from matplotlib.figure import Figure
        from matplotlib.dates import DateFormatter
        
        now = datetime.utcnow()

        def fetch_count(start, step):
            return AnalysisEntry.objects.filter(time__gte=start, time__lt=start + step).count()

        def plot_data(plot, rounded_now, step, steps, format):
            rounded_now += step

            times = []
            counts = []

            current = rounded_now - (steps + 1) * step
            for i in range(steps + 1):
                times.append(current)
                counts.append(fetch_count(current, step))

                current += step

            # A bar plot
            plot.bar(times, counts, width=step/timedelta(days=1), align='center')
            # Axis names
            plot.xaxis_date()
            plot.xaxis.set_major_formatter(DateFormatter(format))
            plot.set_xlim([now - step * steps, now])

        # Create plots
        figure = Figure(figsize=(20, 20))

        # Plot every minute for last hour
        minute_hour = figure.add_subplot(221)
        minute_hour.set_title('Last hour')
        rounded_now = datetime(now.year, now.month, now.day, now.hour, now.minute)
        plot_data(minute_hour, rounded_now, timedelta(minutes=1), 60, '%H:%M')

        # Every hour for last day
        hour_day = figure.add_subplot(222)
        hour_day.set_title('Last day')
        rounded_now = datetime(now.year, now.month, now.day, now.hour)
        plot_data(hour_day, rounded_now, timedelta(hours=1), 24, '%m-%d %H')

        # Every day for last 30 days
        day_30days = figure.add_subplot(223)
        day_30days.set_title('Last 30 days')
        rounded_now = datetime(now.year, now.month, now.day)
        plot_data(day_30days, rounded_now, timedelta(days=1), 30, '%m-%d')

        # Every day for last 365 days
        day_365days = figure.add_subplot(224)
        day_365days.set_title('Last 365 days')
        rounded_now = datetime(now.year, now.month, now.day)
        plot_data(day_365days, rounded_now, timedelta(days=1), 365, '%Y-%m')
        
        # Fill http response
        canvas = FigureCanvas(figure)
        response = HttpResponse(content_type='image/png')
        canvas.print_png(response)
        return response

