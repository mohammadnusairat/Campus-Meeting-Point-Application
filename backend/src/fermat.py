from geopy.distance import geodesic
import numpy as np

def geodesic_fermat_point(locations, max_iter=100, tol=1e-6):
    """
    Compute the Fermat point of three geographic coordinates using the Weiszfeld algorithm.
    
    :param locations: List of three tuples [(lat1, lon1), (lat2, lon2), (lat3, lon3)]
    :param max_iter: Maximum number of iterations
    :param tol: Convergence tolerance
    :return: (lat, lon) of the optimal meeting point
    """
    lat0 = sum(loc[0] for loc in locations) / 3
    lon0 = sum(loc[1] for loc in locations) / 3
    p = np.array([lat0, lon0])

    for _ in range(max_iter):
        weights = []
        weighted_sum = np.array([0.0, 0.0])

        for loc in locations:
            d = geodesic(loc, (p[0], p[1])).meters
            if d < tol:
                return tuple(p)
            
            weight = 1 / d
            weights.append(weight)
            weighted_sum += np.array(loc) * weight

        new_p = weighted_sum / sum(weights)

        if geodesic(p, new_p).meters < tol:
            break
        
        p = new_p

    return tuple(p)
