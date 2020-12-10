import random
import math
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.lines as lines
import matplotlib.transforms as mtransforms
import matplotlib.text as mtext

def addline(ax,r,color=None):
    x=[]
    y=[]
    for i,j in r.getedges():
        x.append(i)
        y.append(j)
    line=MyLine(x,y,color=color)
    ax.add_line(line)

class Point:
    def __init__(self,x,y):
        self.x=x
        self.y=y

    def __str__(self):
        return "Point: ({}, {})".format(self.x, self.y)

class Rect:
    def __init__(self,x1,y1,x2,y2):
        self.x1=x1
        self.x2=x2
        self.y1=y1
        self.y2=y2

    def perimeter(self):
        return 2*(abs(self.x2-self.x1) + abs(self.y2-self.y1))

    def contain_rect(self,rect):
        return self.x1<rect.x1 and self.y1<rect.y1 and self.x2<rect.x2 and self.y2<rect.y2

    def __str__(self):
        return "Rect: ({}, {}), ({}, {})".format(self.x1, self.y1, self.x2, self.y2)

    def intersect(self,rect):
        if (self.y1>rect.y2 or self.y2<rect.y1 or\
                self.x1>rect.x2 or self.x2<rect.x1):
            return False
        return True

    def is_covered(self,point):
        return self.x1<=point.x<=self.x2 and self.y1<=point.y<=self.y2

    def getedges(self):
        return [[self.x1,self.y1],[self.x1,self.y2],\
                [self.x2,self.y2],[self.x2,self.y1],[self.x1,self.y1]]


class Node:
    def __init__(self,maxobj):
        self.maxobj = maxobj
        #self.id = 0
        self.child_nodes = []
        self.points = []
        self.parent_node = None
        self.MBR = Rect(-1,-1,-1,-1)

    def getObject(self):
        return self.points if self.is_leaf() else self.MBR
    
    def _showImage(self,ax):
        if(self.is_leaf()):
            v=self.MBR.getedges()
            x=[]
            y=[]
            for i,j in v:
                x.append(i)
                y.append(j)
            line=MyLine(x,y)
            ax.add_line(line)
            return 
        else:
            v=self.MBR.getedges()
            x=[]
            y=[]
            for i,j in v:
                x.append(i)
                y.append(j)
            line=MyLine(x,y)
            ax.add_line(line)
            for child in self.child_nodes:
                child._showImage(ax)

    def get_parent(self):
        return self.parent_node

    def insert_point(self,point):
        self.points.append(point)

    def is_leaf(self):
        return len(self.child_nodes) == 0

    def is_overflow(self):
        return (self.is_leaf() and len(self.points) > self.maxobj ) or \
                (not self.is_leaf() and len(self.child_nodes) > self.maxobj)

    def insert_child_node(self,node):
        node.parent_node=self
        self.child_nodes.append(node)

    def updateMBR(self):
        if(self.is_leaf()):
            datax=[point.x for point in self.points]
            datay=[point.y for point in self.points]
            self.MBR.x1=min(datax)
            self.MBR.x2=max(datax)
            self.MBR.y1=min(datay)
            self.MBR.y2=max(datay)

        else:
            datax=[child.MBR.x1 for child in self.child_nodes]
            datax1=[child.MBR.x2 for child in self.child_nodes]
            datay=[child.MBR.y1 for child in self.child_nodes]
            datay1=[child.MBR.y2 for child in self.child_nodes]
            self.MBR.x1=min(datax)
            self.MBR.x2=max(datax1)
            self.MBR.y1=min(datay)
            self.MBR.y2=max(datay1)

        if( self.parent_node and not self.parent_node.MBR.contain_rect(self.MBR)):
            self.parent_node.updateMBR()

    def get_pointsMBR_perimeter(self,points):
        x1=min([point.x for point in points ])
        x2=max([point.x for point in points ])
        y1=min([point.y for point in points ])
        y2=min([point.y for point in points ])
        return Rect(x1,y1,x2,y2).perimeter()

    def get_nodesMBR_perimeter(self,nodes):

        x1=min([node.MBR.x1 for node in nodes ])
        x2=max([node.MBR.x2 for node in nodes ])
        y1=min([node.MBR.y1 for node in nodes ])
        y2=max([node.MBR.y2 for node in nodes ])
        return Rect(x1,x2,y1,y2).perimeter()

    def perimeter(self):
        return self.MBR.perimeter()

    def perimeter_increase_with_point(self,point):
        x1=point.x if point.x < self.MBR.x1 else self.MBR.x1
        y1=point.y if point.y < self.MBR.y1 else self.MBR.y1
        x2=point.x if point.x > self.MBR.x2 else self.MBR.x2
        y2=point.y if point.y > self.MBR.y2 else self.MBR.y2
        return Rect(x1,y1,x2,y2).perimeter()-self.perimeter()

class MyLine(lines.Line2D):
    def __init__(self, *args, **kwargs):
        # we'll update the position when the line data is set
        self.text = mtext.Text(0, 0, '')
        lines.Line2D.__init__(self, *args, **kwargs)

        self.text.set_text(self.get_label())

    def set_figure(self, figure):
        self.text.set_figure(figure)
        lines.Line2D.set_figure(self, figure)

    def set_axes(self, axes):
        self.text.set_axes(axes)
        lines.Line2D.set_axes(self, axes)

    def set_transform(self, transform):
        # 2 pixel offset
        texttrans = transform + mtransforms.Affine2D().translate(2, 2)
        self.text.set_transform(texttrans)
        lines.Line2D.set_transform(self, transform)

    def set_data(self, x, y):
        if len(x):
            self.text.set_position((x[-1], y[-1]))

        lines.Line2D.set_data(self, x, y)

    def draw(self, renderer):
        # draw my label at the end of the line with 2 pixel offset
        lines.Line2D.draw(self, renderer)
        self.text.draw(renderer)

class RTree:
    def __init__(self, maxobj=4):
        self.maxobj = maxobj
        self.root = Node(self.maxobj) 

    def insert(self,point,node=None):
        if(node is None):
            node = self.root

        if(node.is_leaf()):
            node.insert_point(point)
            node.updateMBR()
            if (node.is_overflow()):
                self.handle_overflow(node)

        else:
            node_v=self.choose_subtree(node,point)
            self.insert(point,node_v)

    def handle_overflow(self,node):
        #split
        node,new_node = self.split_leaf_node(node) if node.is_leaf() else self.split_internal_node(node)
        if (node is self.root) :
            self.root = Node(self.maxobj)
            self.root.insert_child_node(node)
            self.root.insert_child_node(new_node)
            self.root.updateMBR()
        else:
            w_node=node.get_parent()
            w_node.insert_child_node(new_node)
            w_node.updateMBR()
            if(w_node.is_overflow()):
                    self.handle_overflow(w_node)


    def choose_subtree(self,node,point):
        best_child=None
        best_perimeter = 0

        for item in node.child_nodes:
            if( node.child_nodes.index(item) == 0 or \
                best_perimeter > item.perimeter_increase_with_point(point)):
                best_child=item
                best_perimeter=item.perimeter_increase_with_point(point)
        return best_child

    def split_leaf_node(self,node):
        m = len(node.points)
        best_perimeter = -1
        best_set1 = []
        best_set2 = []
        pointsortx=sorted(node.points, key=lambda point: point.x)
        for i in range(int(0.4*m),int(0.6*m)+1):
            S1=pointsortx[:i]
            S2=pointsortx[i:]
            tempP = node.get_pointsMBR_perimeter(S1)\
                    +node.get_pointsMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2

        pointsorty=sorted(node.points, key=lambda point: point.y)
        
        for i in range(int(0.4*m),int(0.6*m)+1):
            S1=pointsorty[:i]
            S2=pointsorty[i:]
            tempP=node.get_pointsMBR_perimeter(S1)\
                    +node.get_pointsMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2
        
        (best_set1)
        (best_set2)
        node.points=best_set1
        node.updateMBR()
        new_node=Node(self.maxobj)
        for pointt in best_set2:
            new_node.insert_point(pointt)
        new_node.updateMBR()
        return node,new_node
        
    def split_internal_node(self,node):
        m = len(node.child_nodes)
        best_perimeter = -1
        best_set1 = []
        best_set2 = []
        pointsortx1=sorted(node.child_nodes, key=lambda child: child.MBR.x1)
        for i in range(int(0.4*m),int(0.6*m)+1):        
            S1=pointsortx1[:i]
            S2=pointsortx1[i:]
            tempP = node.get_nodesMBR_perimeter(S1)\
                    +node.get_nodesMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2
        
        pointsortx2=sorted(node.child_nodes, key=lambda child: child.MBR.x2)
        for i in range(int(0.4*m),int(0.6*m)+1):     
            S1=pointsortx2[:i]
            S2=pointsortx2[i:]
            tempP = node.get_nodesMBR_perimeter(S1)\
                    +node.get_nodesMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2

        pointsorty1=sorted(node.child_nodes, key=lambda child: child.MBR.y1)
        for i in range(int(0.4*m),int(0.6*m)+1):
            S1=pointsorty1[:i]
            S2=pointsorty1[i:]
            tempP=node.get_nodesMBR_perimeter(S1)\
                    +node.get_nodesMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2
        pointsorty2=sorted(node.child_nodes, key=lambda child: child.MBR.y2)
        
        for i in range(int(0.4*m),int(0.6*m)+1):
            S1=pointsorty2[:i]
            S2=pointsorty2[i:]
            tempP=node.get_nodesMBR_perimeter(S1)\
                    +node.get_nodesMBR_perimeter(S2)
            if( best_perimeter == -1 or best_perimeter > tempP):
                best_perimeter = tempP
                best_set1=S1
                best_set2=S2
        
        node.child_nodes =best_set1
        node.updateMBR()
        new_node=Node(self.maxobj)
        for pointt in best_set2:
            new_node.insert_child_node(pointt)
        new_node.updateMBR()
        return node,new_node

    def range_query(self,region,node=None):
        if node is None:
            node=self.root

        if(node.is_leaf()):
            points=[]
            for point in node.points:
                if(region.is_covered(point)):
                    points.append(point)
            return points

        else:
            points=[]
            for child in node.child_nodes:
                if( region.intersect(child.MBR)):
                    points+=self.range_query(region,child)
            return points

    def showRtree(self,ax):
        self.root._showImage(ax)
  
def main():
    tree = RTree(3)

    fig, ax = plt.subplots()
    for i in range(10):
        a = Point(random.randint(0,100),random.randint(0,100))
        print(a)
        plt.scatter(a.x,a.y,color='black')
        tree.insert(a)

    tree.showRtree(ax)

    r=Rect(20,30,70,80)
    addline(ax,r,'red')
    v=tree.range_query(r)
    for l in v:
        print("x: "+str(l.x)+" y: "+str(l.y))
    for p in v: 
        plt.scatter(p.x,p.y,color='red')

    #print("puntos en query: ")
    #print(range_query(r))
    ax.set_xlim(-1,105)
    ax.set_ylim(-1,105)
    plt.show()
main()
